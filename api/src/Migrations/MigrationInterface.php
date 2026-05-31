<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

/**
 * Interface for database migrations.
 */
interface MigrationInterface
{
    /**
     * Get migration version (e.g., "20260531_001").
     */
    public function getVersion(): string;

    /**
     * Get migration description.
     */
    public function getDescription(): string;

    /**
     * Apply the migration.
     */
    public function up(PDO $pdo): void;

    /**
     * Rollback the migration (optional, for future use).
     */
    public function down(PDO $pdo): void;
}
