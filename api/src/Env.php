<?php

declare(strict_types=1);

namespace Natagora\API;

/**
 * Minimal .env loader without external dependencies.
 * Existing process environment variables always win.
 */
class Env
{
    /**
     * @param string[] $paths
     */
    public static function load(array $paths): void
    {
        foreach ($paths as $path) {
            self::loadFile($path);
        }
    }

    public static function loadFile(string $path): void
    {
        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $name = trim($parts[0]);
            if ($name === '') {
                continue;
            }

            if (getenv($name) !== false) {
                continue;
            }

            $value = trim($parts[1]);
            $value = self::stripWrappingQuotes($value);

            putenv($name . '=' . $value);
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }

    private static function stripWrappingQuotes(string $value): string
    {
        if (strlen($value) < 2) {
            return $value;
        }

        $first = $value[0];
        $last = $value[strlen($value) - 1];

        if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
            return substr($value, 1, -1);
        }

        return $value;
    }
}
