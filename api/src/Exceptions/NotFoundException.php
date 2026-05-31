<?php

declare(strict_types=1);

namespace Natagora\API\Exceptions;

/**
 * Exception thrown when a resource is not found.
 */
class NotFoundException extends ApiException
{
    public function __construct(string $message = 'Ressource introuvable.')
    {
        parent::__construct($message, 404);
    }
}
