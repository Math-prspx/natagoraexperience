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
];
