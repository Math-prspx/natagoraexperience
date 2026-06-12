<?php

declare(strict_types=1);

$env = static function (string $key, mixed $default = null): mixed {
    $value = getenv($key);
    return $value === false ? $default : $value;
};

// ============================================================
//  Configuration template for deploy package
//  ⚠️  Keep real secrets only in environment variables / .env on server
//  Emergency fallback below is temporary and must be reverted after access recovery.
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
        // Temporary hard override for access recovery when server env cannot be edited.
        'username'      => 'admin-recovery',
        'password_hash' => '$2y$12$ypHWaRVUVuKJ2FZQhh3mveHErDej6dXNGyN6tFFvVwbXUtSrMYaE.',
        'secret'        => '79b36f78c9bd79c7014bfd61125a2ded1e25fb7a49ab9c4d6ab28c632329aed9',
        'token_ttl'     => (int) $env('ADMIN_TOKEN_TTL', 28800),
    ],
];

return $config;
