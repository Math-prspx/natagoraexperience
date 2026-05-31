<?php

declare(strict_types=1);

namespace Natagora\API;

use PDO;

class DatabaseMigrations
{
    public static function ensureWalkExtraColumns(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            $rows = $pdo->query('PRAGMA table_info(walks)')->fetchAll();
            $existing = [];
            foreach ($rows as $row) {
                $existing[(string) $row['name']] = true;
            }

            if (!isset($existing['distance_km'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN distance_km REAL NULL');
            }
            if (!isset($existing['target_public'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN target_public TEXT NULL');
            }
            if (!isset($existing['practical_info_json'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN practical_info_json TEXT NULL');
            }
            if (!isset($existing['pmr_accessible'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN pmr_accessible INTEGER NULL');
            }

            return;
        }

        if ($driver === 'mysql') {
            $rows = $pdo->query('DESCRIBE walks')->fetchAll();
            $existing = [];
            foreach ($rows as $row) {
                $existing[(string) $row['Field']] = true;
            }

            if (!isset($existing['distance_km'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN distance_km DECIMAL(6,2) NULL');
            }
            if (!isset($existing['target_public'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN target_public VARCHAR(180) NULL');
            }
            if (!isset($existing['practical_info_json'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN practical_info_json JSON NULL');
            }
            if (!isset($existing['pmr_accessible'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN pmr_accessible TINYINT(1) NULL');
            }
        }
    }
}
