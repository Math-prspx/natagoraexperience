<?php

declare(strict_types=1);

$host = getenv('DB_HOST') ?: '';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: '';
$user = getenv('DB_USER') ?: '';
$pass = getenv('DB_PASS') ?: '';
$charset = getenv('DB_CHARSET') ?: 'utf8mb4';

if ($host === '' || $dbName === '' || $user === '') {
    fwrite(STDERR, "Missing DB env vars. Required: DB_HOST, DB_NAME, DB_USER, DB_PASS\n");
    exit(1);
}

$output = $argv[1] ?? (getcwd() . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'exports' . DIRECTORY_SEPARATOR . 'natagora_' . date('Ymd_His') . '.sql');
$outDir = dirname($output);
if (!is_dir($outDir) && !mkdir($outDir, 0777, true) && !is_dir($outDir)) {
    fwrite(STDERR, "Cannot create output directory: {$outDir}\n");
    exit(1);
}

$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', $host, $port, $dbName, $charset);

$pdoOptions = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

if (defined('PDO::MYSQL_ATTR_USE_BUFFERED_QUERY')) {
    $pdoOptions[PDO::MYSQL_ATTR_USE_BUFFERED_QUERY] = false;
}

try {
    $pdo = new PDO($dsn, $user, $pass, $pdoOptions);
} catch (Throwable $e) {
    fwrite(STDERR, "DB connection failed: {$e->getMessage()}\n");
    exit(1);
}

$fp = fopen($output, 'wb');
if ($fp === false) {
    fwrite(STDERR, "Cannot open output file: {$output}\n");
    exit(1);
}

fwrite($fp, "-- Natagora DB export\n");
fwrite($fp, "-- Generated at " . date('c') . "\n\n");
fwrite($fp, "SET NAMES utf8mb4;\n");
fwrite($fp, "SET FOREIGN_KEY_CHECKS=0;\n\n");

$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);

foreach ($tables as $tableRow) {
    $table = (string) $tableRow[0];

    $createRow = $pdo->query('SHOW CREATE TABLE `' . str_replace('`', '``', $table) . '`')->fetch(PDO::FETCH_ASSOC);
    $createSql = (string) ($createRow['Create Table'] ?? '');

    fwrite($fp, "-- --------------------------------------------------------\n");
    fwrite($fp, "-- Table `{$table}`\n\n");
    fwrite($fp, "DROP TABLE IF EXISTS `{$table}`;\n");
    fwrite($fp, $createSql . ";\n\n");

    $stmt = $pdo->query('SELECT * FROM `' . str_replace('`', '``', $table) . '`');
    $columns = [];
    for ($i = 0, $count = $stmt->columnCount(); $i < $count; $i++) {
        $meta = $stmt->getColumnMeta($i);
        $columns[] = '`' . str_replace('`', '``', (string) $meta['name']) . '`';
    }

    $rowCount = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $values = [];
        foreach ($row as $value) {
            if ($value === null) {
                $values[] = 'NULL';
            } else {
                $values[] = $pdo->quote((string) $value);
            }
        }

        $insert = 'INSERT INTO `' . $table . '` (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $values) . ");\n";
        fwrite($fp, $insert);
        $rowCount++;
    }

    if ($rowCount > 0) {
        fwrite($fp, "\n");
    }
}

fwrite($fp, "SET FOREIGN_KEY_CHECKS=1;\n");
fclose($fp);

echo "Export completed: {$output}\n";
