<?php

declare(strict_types=1);

$env = static function (string $key, mixed $default = null): mixed {
    $value = getenv($key);
    return $value === false ? $default : $value;
};

// ============================================================
//  Configuration template for deploy package
//  ⚠️  Keep real secrets only in environment variables / .env on server
// ============================================================

$config = [
    'db' => [
        'driver'      => (string) $env('DB_DRIVER', 'mysql'),
        'host'        => (string) $env('DB_HOST', 'REPLACE_DB_HOST'),
        'port'        => (int) $env('DB_PORT', 3306),
        'name'        => (string) $env('DB_NAME', 'REPLACE_DB_NAME'),
        'user'        => (string) $env('DB_USER', 'REPLACE_DB_USER'),
        'pass'        => (string) $env('DB_PASS', 'REPLACE_DB_PASS'),
        'charset'     => (string) $env('DB_CHARSET', 'utf8mb4'),
        'sqlite_path' => (string) $env('DB_SQLITE_PATH', __DIR__ . '/../database/local.sqlite'),
    ],
    'app' => [
        'base_url'       => (string) $env('APP_BASE_URL', '/api'),
        'default_locale' => (string) $env('APP_DEFAULT_LOCALE', 'fr'),
    ],
    'auth' => [
        'username'      => (string) $env('ADMIN_USERNAME', 'REPLACE_ADMIN_USERNAME'),
        'password_hash' => (string) $env('ADMIN_PASSWORD_HASH', 'REPLACE_WITH_BCRYPT_HASH'),
        'secret'        => (string) $env('ADMIN_AUTH_SECRET', 'REPLACE_WITH_RANDOM_64_HEX_SECRET'),
        'token_ttl'     => (int) $env('ADMIN_TOKEN_TTL', 28800),
    ],
];

return $config;
