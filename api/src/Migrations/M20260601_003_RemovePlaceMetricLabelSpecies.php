<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

class M20260601_003_RemovePlaceMetricLabelSpecies implements MigrationInterface
{
    public function up(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            $cols = array_column(
                $pdo->query("PRAGMA table_info(places)")->fetchAll(),
                'name'
            );
            if (in_array('metric_map_label', $cols, true)) {
                $pdo->exec("ALTER TABLE places DROP COLUMN metric_map_label");
            }
            if (in_array('species_count', $cols, true)) {
                $pdo->exec("ALTER TABLE places DROP COLUMN species_count");
            }
        } else {
            // MySQL
            $cols = array_column(
                $pdo->query("SHOW COLUMNS FROM places")->fetchAll(),
                'Field'
            );
            if (in_array('metric_map_label', $cols, true)) {
                $pdo->exec("ALTER TABLE places DROP COLUMN metric_map_label");
            }
            if (in_array('species_count', $cols, true)) {
                $pdo->exec("ALTER TABLE places DROP COLUMN species_count");
            }
        }
    }

    public function getVersion(): string
    {
        return '20260601_003';
    }

    public function getDescription(): string
    {
        return 'Remove metric_map_label and species_count from places table';
    }

    public function down(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $pdo->exec("ALTER TABLE places ADD COLUMN metric_map_label TEXT NULL");
            $pdo->exec("ALTER TABLE places ADD COLUMN species_count INTEGER NULL");
        } else {
            $pdo->exec("ALTER TABLE places ADD COLUMN metric_map_label VARCHAR(120) NULL, ADD COLUMN species_count INT NULL");
        }
    }
}
