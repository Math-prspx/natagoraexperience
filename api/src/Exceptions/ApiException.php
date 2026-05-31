<?php

declare(strict_types=1);

namespace Natagora\API\Exceptions;

use Exception;

/**
 * Base API exception with HTTP status code support.
 */
class ApiException extends Exception
{
    private int $statusCode;
    private array $context;

    public function __construct(
        string $message,
        int $statusCode = 500,
        array $context = [],
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->context = $context;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getContext(): array
    {
        return $this->context;
    }
}
