<?php

declare(strict_types=1);

// ============================================================
//  Configuration production — OVH (nothumannatagora.mysql.db)
//  ⚠️  Ne jamais committer ce fichier avec de vrais credentials
// ============================================================

$config = [
    'db' => [
        'driver'      => 'mysql',
        'host'        => 'nothumannatagora.mysql.db',
        'port'        => 3306,
        'name'        => 'nothumannatagora',
        'user'        => 'nothumannatagora',
        'pass'        => 'Test12345',
        'charset'     => 'utf8mb4',
        'sqlite_path' => __DIR__ . '/../database/local.sqlite',
    ],
    'app' => [
        'base_url'       => '/api',
        'default_locale' => 'fr',
    ],
    'auth' => [
        'username'      => 'admin',
        'password_hash' => '$2y$12$XHjQo1sXuuvz4L7FNJv9LePYsbyAey661Np5qXcJn2ueGifLsl3Hm',
        'secret'        => 'b5f778f42f45bfd3babd769f29c35382bf716da4c3c2b3ac0301f44ed80627ae',
        'token_ttl'     => 28800,
    ],
];

// Surcharges optionnelles via variables d'environnement
if (getenv('DB_HOST'))             $config['db']['host']              = getenv('DB_HOST');
if (getenv('DB_NAME'))             $config['db']['name']              = getenv('DB_NAME');
if (getenv('DB_USER'))             $config['db']['user']              = getenv('DB_USER');
if (getenv('DB_PASS'))             $config['db']['pass']              = getenv('DB_PASS');
if (getenv('ADMIN_USERNAME'))      $config['auth']['username']        = getenv('ADMIN_USERNAME');
if (getenv('ADMIN_PASSWORD_HASH')) $config['auth']['password_hash']   = getenv('ADMIN_PASSWORD_HASH');
if (getenv('ADMIN_AUTH_SECRET'))   $config['auth']['secret']          = getenv('ADMIN_AUTH_SECRET');

return $config;
