<?php

declare(strict_types=1);

return [
    'db' => [
        'driver' => 'sqlite', // Use 'sqlite' for local dev, 'mysql' for production
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'natagora_catalogue',
        'user' => 'db_user',
        'pass' => 'db_password',
        'charset' => 'utf8mb4',
        'sqlite_path' => __DIR__ . '/../database/local.sqlite',
    ],
    'app' => [
        'base_url' => '/api',
        'default_locale' => 'fr',
    ],
    'auth' => [
        // Admin login credentials
        // Generate hash: php -r "echo password_hash('your_password', PASSWORD_BCRYPT);"
        'username'      => 'admin',
        'password_hash' => 'REPLACE_WITH_BCRYPT_HASH',
        // Generate secret: php -r "echo bin2hex(random_bytes(32));"
        'secret'        => 'REPLACE_WITH_RANDOM_32_CHAR_SECRET',
        'token_ttl'     => 28800, // 8 hours in seconds
    ],
];
