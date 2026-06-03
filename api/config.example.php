<?php

declare(strict_types=1);

$env = static function (string $key, mixed $default = null): mixed {
    $value = getenv($key);
    return $value === false ? $default : $value;
};

return [
    'db' => [
        'driver' => (string) $env('DB_DRIVER', 'sqlite'), // Use 'sqlite' for local dev, 'mysql' for production
        'host' => (string) $env('DB_HOST', '127.0.0.1'),
        'port' => (int) $env('DB_PORT', 3306),
        'name' => (string) $env('DB_NAME', 'natagora_catalogue'),
        'user' => (string) $env('DB_USER', 'db_user'),
        'pass' => (string) $env('DB_PASS', 'db_password'),
        'charset' => (string) $env('DB_CHARSET', 'utf8mb4'),
        'sqlite_path' => (string) $env('DB_SQLITE_PATH', __DIR__ . '/../database/local.sqlite'),
    ],
    'app' => [
        'base_url' => (string) $env('APP_BASE_URL', '/api'),
        'default_locale' => (string) $env('APP_DEFAULT_LOCALE', 'fr'),
    ],
    'auth' => [
        // Admin login credentials
        // Generate hash: php -r "echo password_hash('your_password', PASSWORD_BCRYPT);"
        'username'      => (string) $env('ADMIN_USERNAME', 'admin'),
        'password_hash' => (string) $env('ADMIN_PASSWORD_HASH', 'REPLACE_WITH_BCRYPT_HASH'),
        // Generate secret: php -r "echo bin2hex(random_bytes(32));"
        'secret'        => (string) $env('ADMIN_AUTH_SECRET', 'REPLACE_WITH_RANDOM_32_CHAR_SECRET'),
        'token_ttl'     => (int) $env('ADMIN_TOKEN_TTL', 28800), // 8 hours in seconds
    ],
];
