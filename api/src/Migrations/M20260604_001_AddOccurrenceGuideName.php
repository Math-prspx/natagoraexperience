<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

class M20260604_001_AddOccurrenceGuideName implements MigrationInterface
{
    public function up(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            $cols = array_column(
                $pdo->query("PRAGMA table_info(walk_occurrences)")->fetchAll(),
                'name'
            );
            if (!in_array('guide_name', $cols, true)) {
                $pdo->exec("ALTER TABLE walk_occurrences ADD COLUMN guide_name TEXT NULL");
            }
            return;
        }

        $cols = array_column(
            $pdo->query("SHOW COLUMNS FROM walk_occurrences")->fetchAll(),
            'Field'
        );
        if (!in_array('guide_name', $cols, true)) {
            $pdo->exec("ALTER TABLE walk_occurrences ADD COLUMN guide_name VARCHAR(180) NULL AFTER ends_at");
        }
    }

    public function getVersion(): string
    {
        return '20260604_001';
    }

    public function getDescription(): string
    {
        return 'Add guide_name column to walk_occurrences';
    }

    public function down(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            return;
        }

        $cols = array_column(
            $pdo->query("SHOW COLUMNS FROM walk_occurrences")->fetchAll(),
            'Field'
        );
        if (in_array('guide_name', $cols, true)) {
            $pdo->exec("ALTER TABLE walk_occurrences DROP COLUMN guide_name");
        }
    }
}
