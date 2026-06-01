<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

/**
 * Migration 20260601_001: Rename content_image_url → intro_image_url on walks table
 * for consistency with places.intro_image_url.
 */
class M20260601_001_RenameWalkContentImageUrl implements MigrationInterface
{
    public function getVersion(): string
    {
        return '20260601_001';
    }

    public function getDescription(): string
    {
        return 'Rename walks.content_image_url to intro_image_url for consistency with places table';
    }

    public function up(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            // SQLite does not support RENAME COLUMN before 3.25.0; use ADD + copy + clear approach
            // PHP 8.4 ships SQLite 3.45+ so RENAME COLUMN is supported
            $rows = $pdo->query('PRAGMA table_info(walks)')->fetchAll();
            $existing = array_column($rows, 'name');

            if (in_array('content_image_url', $existing, true) && !in_array('intro_image_url', $existing, true)) {
                $pdo->exec('ALTER TABLE walks RENAME COLUMN content_image_url TO intro_image_url');
            }
        } elseif ($driver === 'mysql') {
            $rows = $pdo->query('DESCRIBE walks')->fetchAll();
            $existing = array_column($rows, 'Field');

            if (in_array('content_image_url', $existing, true) && !in_array('intro_image_url', $existing, true)) {
                $pdo->exec('ALTER TABLE walks CHANGE content_image_url intro_image_url VARCHAR(500) NULL');
            }
        }
    }

    public function down(PDO $pdo): void
    {
    }
}
