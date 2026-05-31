<?php

declare(strict_types=1);

// Autoload classes (MUST be before namespace)
spl_autoload_register(function (string $class): void {
    $prefix = 'Natagora\\API\\';
    $baseDir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Load config
$config = require __DIR__ . '/config.php';

// Register exception handler
$debugMode = (bool) (getenv('DEBUG_MODE') ?: false);
$exceptionHandler = new \Natagora\API\ExceptionHandler($debugMode);
$exceptionHandler->register();

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    \Natagora\API\Response::noContent();
}

// Database connection
$db = new \Natagora\API\Database($config['db']);
$pdo = $db->pdo();

// Run database migrations
$migrationRunner = new \Natagora\API\Migrations\MigrationRunner($pdo);
$migrationRunner->run();

// Initialize router
$router = new \Natagora\API\Router();
$method = $_SERVER['REQUEST_METHOD'];
$path = \Natagora\API\Router::getRequestPath();

// Initialize controllers
$publicController = new \Natagora\API\Controllers\PublicController($pdo);
$adminMetaController = new \Natagora\API\Controllers\AdminMetaController($pdo);
$adminSubcategoryController = new \Natagora\API\Controllers\AdminSubcategoryController($pdo);
$adminPlaceController = new \Natagora\API\Controllers\AdminPlaceController($pdo);
$adminWalkController = new \Natagora\API\Controllers\AdminWalkController($pdo);
$adminOccurrenceController = new \Natagora\API\Controllers\AdminOccurrenceController($pdo);
$adminImageController = new \Natagora\API\Controllers\AdminImageController(dirname(__DIR__) . '/assets/media/uploads');

// ==========================================
// PUBLIC ROUTES
// ==========================================

$router->get('/', [$publicController, 'index']);
$router->get('/health', [$publicController, 'health']);
$router->get('/public/families', [$publicController, 'families']);
$router->get('/public/subcategories', [$publicController, 'subcategories']);
$router->get('/public/places', [$publicController, 'places']);
$router->get('/public/walks', [$publicController, 'walks']);
$router->get('#^/public/walks/([a-z0-9-]+)$#', [$publicController, 'walkDetail']);

// ==========================================
// ADMIN ROUTES - Meta & Lists
// ==========================================

$router->get('/admin/meta', [$adminMetaController, 'meta']);
$router->get('/admin/families', [$adminMetaController, 'families']);

// ==========================================
// ADMIN ROUTES - Subcategories
// ==========================================

$router->get('/admin/subcategories', [$adminSubcategoryController, 'list']);
$router->post('/admin/subcategories', [$adminSubcategoryController, 'create']);
$router->post('#^/admin/subcategories/(\d+)$#', [$adminSubcategoryController, 'update']);
$router->delete('#^/admin/subcategories/(\d+)$#', [$adminSubcategoryController, 'delete']);

// ==========================================
// ADMIN ROUTES - Places
// ==========================================

$router->get('/admin/places', [$adminPlaceController, 'list']);
$router->post('/admin/places', [$adminPlaceController, 'create']);
$router->post('#^/admin/places/(\d+)$#', [$adminPlaceController, 'update']);

// ==========================================
// ADMIN ROUTES - Walks
// ==========================================

$router->get('/admin/walks', [$adminWalkController, 'list']);
$router->post('/admin/walks', [$adminWalkController, 'create']);
$router->post('#^/admin/walks/(\d+)$#', [$adminWalkController, 'update']);

// ==========================================
// ADMIN ROUTES - Occurrences
// ==========================================

$router->post('/admin/walk-occurrences', [$adminOccurrenceController, 'create']);
$router->post('#^/admin/walk-occurrences/(\d+)$#', [$adminOccurrenceController, 'update']);
$router->delete('#^/admin/walk-occurrences/(\d+)$#', [$adminOccurrenceController, 'delete']);

// ==========================================
// ADMIN ROUTES - Image Upload
// ==========================================

$router->post('/admin/upload-image', [$adminImageController, 'upload']);

// ==========================================
// DISPATCH
// ==========================================

$router->dispatch($method, $path);
