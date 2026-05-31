<?php

declare(strict_types=1);

namespace Natagora\API\Migrations;

use PDO;

/**
 * Migration manager with version tracking.
 */
class MigrationRunner
{
    private PDO $pdo;
    private string $migrationsTable = 'schema_migrations';

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->ensureMigrationsTable();
    }

    /**
     * Run all pending migrations.
     */
    public function run(): array
    {
        $applied = [];
        $migrations = $this->getAvailableMigrations();
        $executed = $this->getExecutedMigrations();

        foreach ($migrations as $migration) {
            $version = $migration->getVersion();
            
            if (in_array($version, $executed, true)) {
                continue; // Already executed
            }

            try {
                $this->pdo->beginTransaction();
                
                $migration->up($this->pdo);
                $this->recordMigration($version, $migration->getDescription());
                
                $this->pdo->commit();
                $applied[] = $version;
            } catch (\Throwable $e) {
                $this->pdo->rollBack();
                throw new \RuntimeException(
                    sprintf('Migration %s failed: %s', $version, $e->getMessage()),
                    0,
                    $e
                );
            }
        }

        return $applied;
    }

    /**
     * Get list of all available migration classes.
     * 
     * @return MigrationInterface[]
     */
    private function getAvailableMigrations(): array
    {
        $migrations = [];
        
        // List all migration files (M followed by date pattern)
        $migrationsDir = __DIR__;
        $files = glob($migrationsDir . '/M[0-9]*.php');
        
        if ($files === false) {
            return [];
        }

        foreach ($files as $file) {
            $className = 'Natagora\\API\\Migrations\\' . basename($file, '.php');
            
            if (!class_exists($className)) {
                continue;
            }

            $migration = new $className();
            
            if ($migration instanceof MigrationInterface) {
                $migrations[] = $migration;
            }
        }

        // Sort by version
        usort($migrations, static function (MigrationInterface $a, MigrationInterface $b): int {
            return strcmp($a->getVersion(), $b->getVersion());
        });

        return $migrations;
    }

    /**
     * Get list of already executed migration versions.
     * 
     * @return string[]
     */
    private function getExecutedMigrations(): array
    {
        $stmt = $this->pdo->query(
            "SELECT version FROM {$this->migrationsTable} ORDER BY version ASC"
        );

        return array_column($stmt->fetchAll(), 'version');
    }

    /**
     * Record that a migration has been executed.
     */
    private function recordMigration(string $version, string $description): void
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO {$this->migrationsTable} (version, description, executed_at)
            VALUES (:version, :description, CURRENT_TIMESTAMP)"
        );

        $stmt->execute([
            'version' => $version,
            'description' => $description,
        ]);
    }

    /**
     * Ensure the migrations tracking table exists.
     */
    private function ensureMigrationsTable(): void
    {
        $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            $this->pdo->exec(
                "CREATE TABLE IF NOT EXISTS {$this->migrationsTable} (
                    version TEXT PRIMARY KEY,
                    description TEXT NOT NULL,
                    executed_at TEXT NOT NULL
                )"
            );
        } elseif ($driver === 'mysql') {
            $this->pdo->exec(
                "CREATE TABLE IF NOT EXISTS {$this->migrationsTable} (
                    version VARCHAR(191) PRIMARY KEY,
                    description VARCHAR(255) NOT NULL,
                    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );
        }
    }

    /**
     * Get migration status (which are pending).
     */
    public function status(): array
    {
        $migrations = $this->getAvailableMigrations();
        $executed = $this->getExecutedMigrations();

        $status = [];
        foreach ($migrations as $migration) {
            $version = $migration->getVersion();
            $status[] = [
                'version' => $version,
                'description' => $migration->getDescription(),
                'executed' => in_array($version, $executed, true),
            ];
        }

        return $status;
    }
}
