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

// Load optional .env files (local root and api folder)
\Natagora\API\Env::load([
    dirname(__DIR__) . '/.env',
    dirname(__DIR__) . '/.env.local',
    dirname(__DIR__) . '/.env.deploy.local',
    __DIR__ . '/.env',
    __DIR__ . '/.env.local',
    __DIR__ . '/.env.deploy.local',
]);

// Load config
$config = require __DIR__ . '/config.php';

// Register exception handler
$debugMode = (bool) (getenv('DEBUG_MODE') ?: false);
$logger = new \Natagora\API\Logger(__DIR__ . '/logs');
$exceptionHandler = new \Natagora\API\ExceptionHandler($debugMode, $logger);
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

// Initialize cache (TTL 5 min)
$cache = new \Natagora\API\Cache(__DIR__ . '/cache', 300);

// Initialize auth
$auth = new \Natagora\API\Auth(
    $config['auth']['secret'],
    (int) ($config['auth']['token_ttl'] ?? 28800)
);

// Auth guard: protect all /admin/* routes except /admin/login
if (str_starts_with($path, '/admin/') && $path !== '/admin/login') {
    // Apache may strip Authorization header — multiple fallbacks
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? (function_exists('getallheaders') ? (getallheaders()['Authorization'] ?? '') : '')
        ?? '';
    $token = str_starts_with($authHeader, 'Bearer ') ? substr($authHeader, 7) : '';
    if ($token === '' || $auth->verifyToken($token) === null) {
        \Natagora\API\Response::json(['error' => 'Non autorisé.'], 401);
        exit;
    }
}

// Initialize controllers
$adminAuthController = new \Natagora\API\Controllers\AdminAuthController(
    $auth,
    $config['auth']['username'],
    $config['auth']['password_hash']
);
$publicController = new \Natagora\API\Controllers\PublicController($pdo, $cache);
$adminMetaController = new \Natagora\API\Controllers\AdminMetaController($pdo);
$adminSubcategoryController = new \Natagora\API\Controllers\AdminSubcategoryController($pdo, $logger, $cache);
$adminPlaceController = new \Natagora\API\Controllers\AdminPlaceController($pdo, $logger, $cache);
$adminWalkController = new \Natagora\API\Controllers\AdminWalkController($pdo, $logger, $cache);
$adminOccurrenceController = new \Natagora\API\Controllers\AdminOccurrenceController($pdo, $logger, $cache);
$adminImageController = new \Natagora\API\Controllers\AdminImageController(dirname(__DIR__) . '/assets/media/uploads', $logger);

// ==========================================
// AUTH ROUTES
// ==========================================

$router->post('/admin/login', [$adminAuthController, 'login']);

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
$router->get('#^/admin/places/(\d+)$#', [$adminPlaceController, 'detail']);
$router->post('#^/admin/places/(\d+)$#', [$adminPlaceController, 'update']);
$router->delete('#^/admin/places/(\d+)$#', [$adminPlaceController, 'delete']);

// ==========================================
// ADMIN ROUTES - Walks
// ==========================================

$router->get('/admin/walks', [$adminWalkController, 'list']);
$router->get('#^/admin/walks/(\d+)$#', [$adminWalkController, 'detail']);
$router->post('/admin/walks', [$adminWalkController, 'create']);
$router->post('#^/admin/walks/(\d+)$#', [$adminWalkController, 'update']);
$router->delete('#^/admin/walks/(\d+)$#', [$adminWalkController, 'delete']);

// ==========================================
// ADMIN ROUTES - Occurrences
// ==========================================

$router->get('/admin/walk-occurrences', [$adminOccurrenceController, 'list']);
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
