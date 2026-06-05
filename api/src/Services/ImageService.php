<?php

declare(strict_types=1);

namespace Natagora\API\Services;

use Natagora\API\Exceptions\ValidationException;
use Natagora\API\Exceptions\ApiException;
use Throwable;

class ImageService
{
    private const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    // Thumbnail max width/height (preserving ratio)
    private const THUMB_SIZE = 400;

    // WebP quality (0-100)
    private const WEBP_QUALITY = 82;

    // JPEG quality for compressed originals
    private const JPEG_QUALITY = 85;

    private const ALLOWED_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    private const EXTENSION_TO_MIME = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'gif'  => 'image/gif',
    ];

    private string $uploadDir;
    private bool $gdAvailable;

    public function __construct(string $uploadDir)
    {
        $this->uploadDir  = $uploadDir;
        $this->gdAvailable = extension_loaded('gd');
    }

    /**
     * Upload, optimise (WebP conversion + thumbnail) and return URLs.
     *
     * Returns array:
     *   'url'       => public URL of the (WebP-converted) image
     *   'thumb_url' => public URL of the thumbnail (or same as url if GD unavailable)
     */
    public function upload(array $file): array
    {
        // Validate file presence
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new ValidationException('Echec du televersement image.');
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        if ($tmpName === '' || !is_uploaded_file($tmpName)) {
            throw new ValidationException('Fichier image invalide.');
        }

        // Validate size
        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0 || $size > self::MAX_SIZE) {
            throw new ValidationException('Image trop lourde (max 8MB).');
        }

        // Detect MIME type
        $mimeType = $this->detectMimeType($tmpName, (string) ($file['name'] ?? ''));
        if ($mimeType === null || !array_key_exists($mimeType, self::ALLOWED_TYPES)) {
            throw new ValidationException('Format image non supporte.');
        }

        // Ensure upload directory exists
        if (!is_dir($this->uploadDir) && !mkdir($this->uploadDir, 0775, true) && !is_dir($this->uploadDir)) {
            throw new ApiException('Impossible de creer le dossier uploads.', 500);
        }

        // Generate base filename (no extension yet — assigned after optional WebP conversion)
        $basename = $this->generateBasename();

        if ($this->gdAvailable && $mimeType !== 'image/gif') {
            // Convert to WebP + generate thumbnail
            $url      = $this->processWithGd($tmpName, $mimeType, $basename);
            $thumbUrl = $this->generateThumbnail($this->uploadDir . '/' . basename($url), $basename);
        } else {
            // GD unavailable or animated GIF: store as-is
            $ext      = self::ALLOWED_TYPES[$mimeType];
            $filename = $basename . '.' . $ext;
            $destPath = $this->uploadDir . '/' . $filename;
            if (!move_uploaded_file($tmpName, $destPath)) {
                throw new ApiException('Impossible d enregistrer l image.', 500);
            }
            $url      = '/assets/media/uploads/' . $filename;
            $thumbUrl = $url;
        }

        return [
            'url'       => $url,
            'thumb_url' => $thumbUrl,
        ];
    }

    /**
     * Convert uploaded image to WebP and save it.
     * Returns the public URL of the WebP file.
     */
    private function processWithGd(string $tmpPath, string $mimeType, string $basename): string
    {
        $src = $this->createGdImage($tmpPath, $mimeType);
        if ($src === false) {
            // GD failed to read — fallback: store original
            $ext      = self::ALLOWED_TYPES[$mimeType];
            $filename = $basename . '.' . $ext;
            copy($tmpPath, $this->uploadDir . '/' . $filename);
            return '/assets/media/uploads/' . $filename;
        }

        $filename = $basename . '.webp';
        $destPath = $this->uploadDir . '/' . $filename;

        imagewebp($src, $destPath, self::WEBP_QUALITY);
        imagedestroy($src);

        return '/assets/media/uploads/' . $filename;
    }

    /**
     * Generate a thumbnail (max THUMB_SIZE px on longest side) from an existing image file.
     * Returns the public URL of the thumbnail.
     */
    private function generateThumbnail(string $sourcePath, string $basename): string
    {
        $info = @getimagesize($sourcePath);
        if ($info === false) {
            return '/assets/media/uploads/' . basename($sourcePath);
        }

        [$origW, $origH, $type] = $info;

        // Skip thumbnail if image already fits within THUMB_SIZE
        if ($origW <= self::THUMB_SIZE && $origH <= self::THUMB_SIZE) {
            return '/assets/media/uploads/' . basename($sourcePath);
        }

        // Compute dimensions preserving ratio
        if ($origW >= $origH) {
            $newW = self::THUMB_SIZE;
            $newH = (int) round($origH * self::THUMB_SIZE / $origW);
        } else {
            $newH = self::THUMB_SIZE;
            $newW = (int) round($origW * self::THUMB_SIZE / $origH);
        }

        $mimeType = $info['mime'];
        $src = $this->createGdImage($sourcePath, $mimeType);
        if ($src === false) {
            return '/assets/media/uploads/' . basename($sourcePath);
        }

        $thumb = imagecreatetruecolor($newW, $newH);
        if ($thumb === false) {
            imagedestroy($src);
            return '/assets/media/uploads/' . basename($sourcePath);
        }

        // Preserve transparency for PNG/WebP sources that became WebP
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
        $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
        if ($transparent !== false) {
            imagefilledrectangle($thumb, 0, 0, $newW, $newH, $transparent);
        }

        imagecopyresampled($thumb, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        imagedestroy($src);

        $thumbFilename = $basename . '_thumb.webp';
        $thumbPath     = $this->uploadDir . '/' . $thumbFilename;
        imagewebp($thumb, $thumbPath, self::WEBP_QUALITY);
        imagedestroy($thumb);

        return '/assets/media/uploads/' . $thumbFilename;
    }

    /**
     * Create a GD image resource from a file path and its MIME type.
     * Returns false on failure.
     *
     * @return \GdImage|false
     */
    private function createGdImage(string $path, string $mimeType): mixed
    {
        return match ($mimeType) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png'  => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            default      => false,
        };
    }

    private function detectMimeType(string $tmpPath, string $originalName): ?string
    {
        $imageInfo = @getimagesize($tmpPath);
        if (is_array($imageInfo) && isset($imageInfo['mime'])) {
            $mimeType = (string) $imageInfo['mime'];
            if (array_key_exists($mimeType, self::ALLOWED_TYPES)) {
                return $mimeType;
            }
        }

        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        return self::EXTENSION_TO_MIME[$ext] ?? null;
    }

    private function generateBasename(): string
    {
        try {
            $token = bin2hex(random_bytes(10));
        } catch (Throwable) {
            $token = uniqid('img_', true);
        }

        return date('Ymd_His') . '_' . $token;
    }
}
