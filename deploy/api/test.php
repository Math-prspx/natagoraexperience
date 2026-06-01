<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

echo 'PHP: ' . phpversion() . "\n";

spl_autoload_register(function (string $class): void {
    $prefix = 'Natagora\\API\\';
    $baseDir = __DIR__ . '/src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $file = $baseDir . str_replace('\\', '/', substr($class, $len)) . '.php';
    if (file_exists($file)) require $file;
});
echo "Autoload OK\n";

$config = require __DIR__ . '/config.php';
echo "Config OK\n";

$db = new \Natagora\API\Database($config['db']);
echo "DB OK\n";

$pdo = $db->pdo();
echo "PDO OK\n";

$runner = new \Natagora\API\Migrations\MigrationRunner($pdo);
echo "MigrationRunner OK\n";

$runner->run();
echo "Migrations OK\n";
