<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

/**
 * Migration 20260531_001: Add extra columns to walks table.
 * 
 * Adds: distance_km, target_public, practical_info_json, pmr_accessible
 */
class M20260531_001_AddWalkExtraColumns implements MigrationInterface
{
    public function getVersion(): string
    {
        return '20260531_001';
    }

    public function getDescription(): string
    {
        return 'Add extra columns to walks table (distance_km, target_public, practical_info_json, pmr_accessible)';
    }

    public function up(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            // Check which columns already exist
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
        } elseif ($driver === 'mysql') {
            // Check which columns already exist
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
                $pdo->exec('ALTER TABLE walks ADD COLUMN practical_info_json TEXT NULL');
            }
            if (!isset($existing['pmr_accessible'])) {
                $pdo->exec('ALTER TABLE walks ADD COLUMN pmr_accessible TINYINT(1) NULL');
            }
        }
    }

    public function down(PDO $pdo): void
    {
        // Rollback: drop the columns (not implemented for safety)
        // In production, you might want to implement this
    }
}
