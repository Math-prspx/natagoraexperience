<?php

declare(strict_types=1);

namespace Natagora\API;

use PDO;

final class Database
{
    private PDO $pdo;

    public function __construct(array $dbConfig)
    {
        $driver = $dbConfig['driver'] ?? 'mysql';

        if ($driver === 'sqlite') {
            $sqlitePath = $dbConfig['sqlite_path'] ?? (__DIR__ . '/../../database/local.sqlite');
            $dsn = 'sqlite:' . $sqlitePath;
            $user = null;
            $pass = null;
        } else {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $dbConfig['host'],
                (int) $dbConfig['port'],
                $dbConfig['name'],
                $dbConfig['charset']
            );
            $user = $dbConfig['user'];
            $pass = $dbConfig['pass'];
        }

        $this->pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        if ($driver === 'sqlite') {
            $this->pdo->exec('PRAGMA foreign_keys = ON');
        }
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
