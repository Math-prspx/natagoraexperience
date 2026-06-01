<?php

declare(strict_types=1);

namespace Natagora\API;

/**
 * Simple file-based cache for public API endpoints.
 *
 * Cache files are stored as JSON in $cacheDir.
 * Each entry is a file: {key}.json containing {expires, data}.
 */
class Cache
{
    private string $cacheDir;
    private int $defaultTtl;

    public function __construct(string $cacheDir, int $defaultTtl = 300)
    {
        $this->cacheDir = rtrim($cacheDir, '/\\');
        $this->defaultTtl = $defaultTtl;
    }

    /**
     * Get cached data. Returns null if missing or expired.
     */
    public function get(string $key): mixed
    {
        $file = $this->filePath($key);
        if (!file_exists($file)) {
            return null;
        }

        $raw = file_get_contents($file);
        if ($raw === false) {
            return null;
        }

        $entry = json_decode($raw, true);
        if (!is_array($entry) || !isset($entry['expires'], $entry['data'])) {
            return null;
        }

        if (time() > $entry['expires']) {
            @unlink($file);
            return null;
        }

        return $entry['data'];
    }

    /**
     * Store data in cache with optional TTL override.
     */
    public function set(string $key, mixed $data, ?int $ttl = null): void
    {
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }

        $entry = [
            'expires' => time() + ($ttl ?? $this->defaultTtl),
            'data'    => $data,
        ];

        file_put_contents(
            $this->filePath($key),
            json_encode($entry, JSON_UNESCAPED_UNICODE),
            LOCK_EX
        );
    }

    /**
     * Delete a specific cache entry.
     */
    public function delete(string $key): void
    {
        $file = $this->filePath($key);
        if (file_exists($file)) {
            @unlink($file);
        }
    }

    /**
     * Delete all cache entries whose key starts with a given prefix.
     * Use to invalidate a group (e.g. all walk-related entries).
     */
    public function invalidateGroup(string $prefix): void
    {
        if (!is_dir($this->cacheDir)) {
            return;
        }

        $pattern = $this->cacheDir . '/' . preg_quote($prefix, '/');
        foreach (glob($this->cacheDir . '/*.json') ?: [] as $file) {
            $basename = basename($file, '.json');
            if (str_starts_with($basename, $prefix)) {
                @unlink($file);
            }
        }
    }

    /**
     * Delete all cache entries (full flush).
     */
    public function flush(): void
    {
        foreach (glob($this->cacheDir . '/*.json') ?: [] as $file) {
            @unlink($file);
        }
    }

    /**
     * Build a safe filesystem key from an arbitrary string.
     */
    public static function makeKey(string ...$parts): string
    {
        $raw = implode('__', $parts);
        return preg_replace('/[^a-zA-Z0-9_-]/', '_', $raw);
    }

    private function filePath(string $key): string
    {
        return $this->cacheDir . '/' . $key . '.json';
    }
}
