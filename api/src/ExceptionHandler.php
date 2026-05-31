<?php

declare(strict_types=1);

namespace Natagora\API;

use Throwable;
use Natagora\API\Exceptions\ApiException;

/**
 * Centralized exception handler for the API.
 */
class ExceptionHandler
{
    private bool $debugMode;

    public function __construct(bool $debugMode = false)
    {
        $this->debugMode = $debugMode;
    }

    /**
     * Handle an exception and return appropriate JSON response.
     */
    public function handle(Throwable $e): void
    {
        // If it's our custom ApiException, extract status and context
        if ($e instanceof ApiException) {
            $statusCode = $e->getStatusCode();
            $context = $e->getContext();
            
            $payload = [
                'error' => $e->getMessage(),
            ];

            // Add context if available
            if (!empty($context)) {
                $payload = array_merge($payload, $context);
            }

            // Add debug info in debug mode
            if ($this->debugMode) {
                $payload['debug'] = [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ];
            }

            Response::json($payload, $statusCode);
            return;
        }

        // Generic exception (500 Internal Server Error)
        $payload = [
            'error' => 'Erreur interne du serveur.',
        ];

        // In debug mode, show full exception details
        if ($this->debugMode) {
            $payload['message'] = $e->getMessage();
            $payload['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ];
        }

        Response::json($payload, 500);
    }

    /**
     * Register this handler as the global exception handler.
     */
    public function register(): void
    {
        set_exception_handler([$this, 'handle']);
    }
}
