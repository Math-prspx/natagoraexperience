<?php

declare(strict_types=1);

namespace Natagora\API;

class Router
{
    private array $routes = [];

    public function get(string $pattern, callable $handler): void
    {
        $this->addRoute('GET', $pattern, $handler);
    }

    public function post(string $pattern, callable $handler): void
    {
        $this->addRoute('POST', $pattern, $handler);
    }

    public function delete(string $pattern, callable $handler): void
    {
        $this->addRoute('DELETE', $pattern, $handler);
    }

    private function addRoute(string $method, string $pattern, callable $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            // Exact match
            if ($route['pattern'] === $path) {
                call_user_func($route['handler']);
                return;
            }

            // Regex match (if pattern starts with #)
            if (str_starts_with($route['pattern'], '#')) {
                if (preg_match($route['pattern'], $path, $matches)) {
                    // Remove full match, keep only captures
                    array_shift($matches);
                    call_user_func($route['handler'], ...$matches);
                    return;
                }
            }
        }

        // No route matched
        Response::json(['error' => 'Endpoint introuvable.'], 404);
    }

    public static function getRequestPath(): string
    {
        $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');

        if ($scriptDir !== '' && str_starts_with($uriPath, $scriptDir)) {
            $uriPath = substr($uriPath, strlen($scriptDir));
        }

        $uriPath = '/' . ltrim($uriPath, '/');

        return rtrim($uriPath, '/') ?: '/';
    }

    public static function getRequestJson(): array
    {
        $raw = file_get_contents('php://input');

        if ($raw === false || $raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            Response::json(['error' => 'JSON invalide.'], 400);
        }

        return $decoded;
    }
}
