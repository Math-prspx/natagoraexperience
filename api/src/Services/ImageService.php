<?php

declare(strict_types=1);

namespace Natagora\API\Services;

use Natagora\API\Exceptions\ValidationException;
use Natagora\API\Exceptions\ApiException;
use Throwable;

class ImageService
{
    private const MAX_SIZE = 8 * 1024 * 1024; // 8MB
    
    private const ALLOWED_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    private const EXTENSION_TO_MIME = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
    ];

    private string $uploadDir;

    public function __construct(string $uploadDir)
    {
        $this->uploadDir = $uploadDir;
    }

    public function upload(array $file): string
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

        // Generate unique filename
        $filename = $this->generateFilename(self::ALLOWED_TYPES[$mimeType]);
        $targetPath = $this->uploadDir . '/' . $filename;

        // Move uploaded file
        if (!move_uploaded_file($tmpName, $targetPath)) {
            throw new ApiException('Impossible d enregistrer l image.', 500);
        }

        // Return public URL
        return '/assets/media/uploads/' . $filename;
    }

    private function detectMimeType(string $tmpPath, string $originalName): ?string
    {
        // Try to detect from file content
        $imageInfo = @getimagesize($tmpPath);
        if (is_array($imageInfo) && isset($imageInfo['mime'])) {
            $mimeType = (string) $imageInfo['mime'];
            if (array_key_exists($mimeType, self::ALLOWED_TYPES)) {
                return $mimeType;
            }
        }

        // Fallback to extension
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        return self::EXTENSION_TO_MIME[$ext] ?? null;
    }

    private function generateFilename(string $extension): string
    {
        try {
            $token = bin2hex(random_bytes(10));
        } catch (Throwable) {
            $token = uniqid('img_', true);
        }

        return date('Ymd_His') . '_' . $token . '.' . $extension;
    }
}
