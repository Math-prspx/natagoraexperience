<?php

declare(strict_types=1);

namespace Natagora\API\Exceptions;

/**
 * Exception thrown for database errors.
 */
class DatabaseException extends ApiException
{
    public function __construct(string $message = 'Erreur base de données.', ?\Throwable $previous = null)
    {
        parent::__construct($message, 500, [], $previous);
    }
}
