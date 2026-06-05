<?php

declare(strict_types=1);

namespace Natagora\API;

/**
 * Simple structured file logger with daily rotation.
 *
 * Log format (one JSON object per line):
 *   {"ts":"2026-06-01T20:00:00+02:00","level":"ERROR","message":"...","context":{...}}
 *
 * Files: logs/api-YYYY-MM-DD.log
 * Rotation: keeps last MAX_FILES daily log files, deletes older ones.
 */
class Logger
{
    public const ERROR   = 'ERROR';
    public const WARNING = 'WARNING';
    public const INFO    = 'INFO';

    private const MAX_FILES = 30;

    private string $logDir;
    private bool   $enabled;

    public function __construct(string $logDir, bool $enabled = true)
    {
        $this->logDir  = rtrim($logDir, '/\\');
        $this->enabled = $enabled;
    }

    public function error(string $message, array $context = []): void
    {
        $this->write(self::ERROR, $message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->write(self::WARNING, $message, $context);
    }

    public function info(string $message, array $context = []): void
    {
        $this->write(self::INFO, $message, $context);
    }

    private function write(string $level, string $message, array $context): void
    {
        if (!$this->enabled) {
            return;
        }

        if (!is_dir($this->logDir)) {
            @mkdir($this->logDir, 0775, true);
        }

        $entry = json_encode([
            'ts'      => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
            'level'   => $level,
            'message' => $message,
            'context' => $context ?: new \stdClass(),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $file = $this->logDir . '/api-' . date('Y-m-d') . '.log';

        // Append line — suppress errors to never break the API
        @file_put_contents($file, $entry . PHP_EOL, FILE_APPEND | LOCK_EX);

        $this->rotate();
    }

    /**
     * Delete log files older than MAX_FILES days.
     */
    private function rotate(): void
    {
        static $rotated = false;
        if ($rotated) {
            return;
        }
        $rotated = true;

        $files = glob($this->logDir . '/api-????-??-??.log');
        if ($files === false || count($files) <= self::MAX_FILES) {
            return;
        }

        sort($files);
        $toDelete = array_slice($files, 0, count($files) - self::MAX_FILES);
        foreach ($toDelete as $old) {
            @unlink($old);
        }
    }
}
