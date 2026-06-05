<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

class M20260531_002_AddPlaceIntroImage implements MigrationInterface
{
    public function getVersion(): string
    {
        return '20260531_002';
    }

    public function getDescription(): string
    {
        return 'Add intro_image_url column to places table';
    }

    public function up(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            $rows = $pdo->query('PRAGMA table_info(places)')->fetchAll();
            $existing = [];
            foreach ($rows as $row) {
                $existing[(string) $row['name']] = true;
            }

            if (!isset($existing['intro_image_url'])) {
                $pdo->exec('ALTER TABLE places ADD COLUMN intro_image_url TEXT NULL');
            }
        } elseif ($driver === 'mysql') {
            $rows = $pdo->query('DESCRIBE places')->fetchAll();
            $existing = [];
            foreach ($rows as $row) {
                $existing[(string) $row['Field']] = true;
            }

            if (!isset($existing['intro_image_url'])) {
                $pdo->exec('ALTER TABLE places ADD COLUMN intro_image_url VARCHAR(500) NULL AFTER cover_image_url');
            }
        }
    }

    public function down(PDO $pdo): void
    {
    }
}
