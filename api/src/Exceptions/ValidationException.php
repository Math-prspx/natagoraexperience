<?php

declare(strict_types=1);

namespace Natagora\API\Exceptions;

/**
 * Exception thrown when request validation fails.
 */
class ValidationException extends ApiException
{
    public function __construct(string $message, array $context = [])
    {
        parent::__construct($message, 422, $context);
    }
}
