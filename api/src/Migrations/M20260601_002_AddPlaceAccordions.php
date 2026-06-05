<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

class M20260601_002_AddPlaceAccordions implements MigrationInterface
{
    public function up(PDO $pdo): void
    {
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            // SQLite ne supporte pas IF NOT EXISTS sur ALTER COLUMN — on vérifie manuellement
            $cols = array_column(
                $pdo->query("PRAGMA table_info(places)")->fetchAll(),
                'name'
            );

            if (!in_array('accordion1_title', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion1_title TEXT NULL");
            }
            if (!in_array('accordion1_text', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion1_text TEXT NULL");
            }
            if (!in_array('accordion2_title', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion2_title TEXT NULL");
            }
            if (!in_array('accordion2_text', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion2_text TEXT NULL");
            }
        } else {
            // MySQL — pas de IF NOT EXISTS sur ADD COLUMN avant MySQL 8.0.3
            $cols = array_column(
                $pdo->query("SHOW COLUMNS FROM places")->fetchAll(),
                'Field'
            );
            if (!in_array('accordion1_title', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion1_title VARCHAR(255) NULL");
            }
            if (!in_array('accordion1_text', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion1_text TEXT NULL");
            }
            if (!in_array('accordion2_title', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion2_title VARCHAR(255) NULL");
            }
            if (!in_array('accordion2_text', $cols, true)) {
                $pdo->exec("ALTER TABLE places ADD COLUMN accordion2_text TEXT NULL");
            }
        }
    }

    public function getVersion(): string
    {
        return '20260601_002';
    }

    public function getDescription(): string
    {
        return 'Add accordion1_title, accordion1_text, accordion2_title, accordion2_text to places';
    }

    public function down(PDO $pdo): void
    {
        // SQLite ne supporte pas DROP COLUMN avant 3.35 — on laisse vide
    }
}
