<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Services\OccurrenceService;
use Natagora\API\Validators\Validator;
use Natagora\API\Exceptions\ValidationException;

class AdminOccurrenceController
{
    private PDO $pdo;
    private OccurrenceService $service;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->service = new OccurrenceService($pdo);
    }

    public function create(): void
    {
        $payload = Router::getRequestJson();

        $walkId = (int) ($payload['walk_id'] ?? 0);
        if ($walkId <= 0) {
            throw new ValidationException('walk_id est obligatoire.');
        }

        $startsAt = Validator::requiredString($payload, 'starts_at');
        $maxCapacity = Validator::optionalInt($payload, 'max_capacity');

        $data = [
            'walk_id' => $walkId,
            'starts_at' => $startsAt,
            'ends_at' => Validator::optionalString($payload, 'ends_at'),
            'max_capacity' => $maxCapacity,
            'available_capacity' => Validator::optionalInt($payload, 'available_capacity') ?? $maxCapacity,
            'booking_url' => Validator::optionalString($payload, 'booking_url'),
            'booking_embed_url' => Validator::optionalString($payload, 'booking_embed_url'),
            'status' => Validator::optionalString($payload, 'status') ?: 'published',
        ];

        $occurrence = $this->service->create($data);
        Response::json(['item' => $occurrence], 201);
    }

    public function update(string $id): void
    {
        $occurrenceId = (int) $id;
        $payload = Router::getRequestJson();

        $startsAt = Validator::requiredString($payload, 'starts_at');
        $maxCapacity = Validator::optionalInt($payload, 'max_capacity');

        $data = [
            'starts_at' => $startsAt,
            'ends_at' => Validator::optionalString($payload, 'ends_at'),
            'max_capacity' => $maxCapacity,
            'available_capacity' => Validator::optionalInt($payload, 'available_capacity') ?? $maxCapacity,
            'booking_url' => Validator::optionalString($payload, 'booking_url'),
            'booking_embed_url' => Validator::optionalString($payload, 'booking_embed_url'),
            'status' => Validator::optionalString($payload, 'status') ?: 'published',
        ];

        $occurrence = $this->service->update($occurrenceId, $data);
        Response::json(['item' => $occurrence]);
    }

    public function delete(string $id): void
    {
        $occurrenceId = (int) $id;
        $this->service->delete($occurrenceId);

        Response::json([
            'deleted' => true,
            'id' => $occurrenceId,
        ]);
    }
}
