<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$dbPath = $root . '/database/local.sqlite';
$schemaPath = $root . '/database/schema.sqlite.sql';
$seedPath = $root . '/database/seed.sqlite.sql';
$forceReset = in_array('--reset', $argv ?? [], true);

if (!extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "Missing extension: pdo_sqlite. Enable pdo_sqlite/sqlite3 in php.ini before running local mode.\n");
    exit(1);
}

if (!file_exists($schemaPath) || !file_exists($seedPath)) {
    fwrite(STDERR, "Schema or seed file missing.\n");
    exit(1);
}

if (file_exists($dbPath) && !$forceReset) {
    fwrite(STDOUT, "Local SQLite database already exists: " . $dbPath . "\n");
    fwrite(STDOUT, "Use --reset to recreate it from schema + seed.\n");
    exit(0);
}

if (file_exists($dbPath) && $forceReset) {
    unlink($dbPath);
}

$pdo = new PDO('sqlite:' . $dbPath, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$pdo->exec('PRAGMA foreign_keys = ON');

$schemaSql = file_get_contents($schemaPath);
$seedSql = file_get_contents($seedPath);

if ($schemaSql === false || $seedSql === false) {
    fwrite(STDERR, "Unable to read schema/seed files.\n");
    exit(1);
}

$pdo->beginTransaction();
try {
    $pdo->exec($schemaSql);
    $pdo->exec($seedSql);
    $pdo->commit();
} catch (Throwable $exception) {
    $pdo->rollBack();
    fwrite(STDERR, "Init failed: " . $exception->getMessage() . "\n");
    exit(1);
}

fwrite(STDOUT, "Local SQLite database initialized: " . $dbPath . "\n");
