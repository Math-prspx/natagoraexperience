<?php

declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

if ($path === '/api' || str_starts_with($path, '/api/')) {
    $_SERVER['SCRIPT_NAME'] = '/api/index.php';
    $_SERVER['PHP_SELF'] = '/api/index.php';
    require __DIR__ . '/api/index.php';
    return true;
}

if ($path === '/') {
    require __DIR__ . '/index.html';
    return true;
}

http_response_code(404);
echo 'Not Found';
return true;
