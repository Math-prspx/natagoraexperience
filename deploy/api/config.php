<?php

declare(strict_types=1);

$env = static function (string $key, mixed $default = null): mixed {
    $value = getenv($key);
    return $value === false ? $default : $value;
};

// ============================================================
//  Configuration production — OVH (nothumannatagora.mysql.db)
//  ⚠️  Ne jamais committer ce fichier avec de vrais credentials
// ============================================================

$config = [
    'db' => [
        'driver'      => (string) $env('DB_DRIVER', 'mysql'),
        'host'        => (string) $env('DB_HOST', 'nothumannatagora.mysql.db'),
        'port'        => (int) $env('DB_PORT', 3306),
        'name'        => (string) $env('DB_NAME', 'nothumannatagora'),
        'user'        => (string) $env('DB_USER', 'nothumannatagora'),
        'pass'        => (string) $env('DB_PASS', 'Test12345'),
        'charset'     => (string) $env('DB_CHARSET', 'utf8mb4'),
        'sqlite_path' => (string) $env('DB_SQLITE_PATH', __DIR__ . '/../database/local.sqlite'),
    ],
    'app' => [
        'base_url'       => (string) $env('APP_BASE_URL', '/api'),
        'default_locale' => (string) $env('APP_DEFAULT_LOCALE', 'fr'),
    ],
    'auth' => [
        'username'      => (string) $env('ADMIN_USERNAME', 'admin'),
        'password_hash' => (string) $env('ADMIN_PASSWORD_HASH', '$2y$12$XHjQo1sXuuvz4L7FNJv9LePYsbyAey661Np5qXcJn2ueGifLsl3Hm'),
        'secret'        => (string) $env('ADMIN_AUTH_SECRET', 'b5f778f42f45bfd3babd769f29c35382bf716da4c3c2b3ac0301f44ed80627ae'),
        'token_ttl'     => (int) $env('ADMIN_TOKEN_TTL', 28800),
    ],
];

return $config;
