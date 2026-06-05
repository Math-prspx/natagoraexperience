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
    private ?Logger $logger;

    public function __construct(bool $debugMode = false, ?Logger $logger = null)
    {
        $this->debugMode = $debugMode;
        $this->logger    = $logger;
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

            // Log: 5xx are errors, 4xx are warnings
            if ($this->logger !== null) {
                $logContext = [
                    'exception'   => get_class($e),
                    'file'        => $e->getFile(),
                    'line'        => $e->getLine(),
                    'status_code' => $statusCode,
                    'request'     => $this->requestContext(),
                ];
                if ($statusCode >= 500) {
                    $this->logger->error($e->getMessage(), $logContext);
                } else {
                    $this->logger->warning($e->getMessage(), $logContext);
                }
            }

            $payload = ['error' => $e->getMessage()];
            if (!empty($context)) {
                $payload = array_merge($payload, $context);
            }
            if ($this->debugMode) {
                $payload['debug'] = [
                    'exception' => get_class($e),
                    'file'      => $e->getFile(),
                    'line'      => $e->getLine(),
                    'trace'     => $e->getTraceAsString(),
                ];
            }

            Response::json($payload, $statusCode);
            return;
        }

        // Generic exception (500)
        if ($this->logger !== null) {
            $this->logger->error($e->getMessage(), [
                'exception' => get_class($e),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
                'trace'     => $e->getTraceAsString(),
                'request'   => $this->requestContext(),
            ]);
        }

        $payload = ['error' => 'Erreur interne du serveur.'];
        if ($this->debugMode) {
            $payload['message'] = $e->getMessage();
            $payload['debug'] = [
                'exception' => get_class($e),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
                'trace'     => $e->getTraceAsString(),
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

    private function requestContext(): array
    {
        return [
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
            'uri'    => $_SERVER['REQUEST_URI']    ?? 'UNKNOWN',
            'ip'     => $_SERVER['REMOTE_ADDR']    ?? 'UNKNOWN',
        ];
    }
}
