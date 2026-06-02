<?php

declare(strict_types=1);

namespace Natagora\API\Services;

use PDO;
use Natagora\API\Exceptions\NotFoundException;

class OccurrenceService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findAll(?int $walkId = null): array
    {
        $sql = 'SELECT
                wo.id,
                wo.walk_id,
                wo.starts_at,
                wo.ends_at,
                wo.max_capacity,
                wo.available_capacity,
                wo.booking_url,
                wo.booking_embed_url,
                wo.status,
                wo.created_at,
                wo.updated_at,
                w.title AS walk_title,
                w.slug AS walk_slug
            FROM walk_occurrences wo
            INNER JOIN walks w ON w.id = wo.walk_id';

        $params = [];
        if ($walkId !== null) {
            $sql .= ' WHERE wo.walk_id = :walk_id';
            $params['walk_id'] = $walkId;
        }

        $sql .= ' ORDER BY wo.starts_at ASC, wo.id ASC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function findById(int $id): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT
                id, walk_id, starts_at, ends_at,
                max_capacity, available_capacity,
                booking_url, booking_embed_url, status,
                created_at, updated_at
            FROM walk_occurrences
            WHERE id = :id
            LIMIT 1'
        );

        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            throw new NotFoundException('Occurrence introuvable.');
        }

        return $row;
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO walk_occurrences (
                walk_id, starts_at, ends_at,
                max_capacity, available_capacity,
                booking_url, booking_embed_url, status,
                created_at, updated_at
            ) VALUES (
                :walk_id, :starts_at, :ends_at,
                :max_capacity, :available_capacity,
                :booking_url, :booking_embed_url, :status,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )'
        );

        $stmt->execute($data);
        $id = (int) $this->pdo->lastInsertId();

        return $this->findById($id);
    }

    public function update(int $id, array $data): array
    {
        $data['id'] = $id;

        $stmt = $this->pdo->prepare(
            'UPDATE walk_occurrences SET
                starts_at = :starts_at,
                ends_at = :ends_at,
                max_capacity = :max_capacity,
                available_capacity = :available_capacity,
                booking_url = :booking_url,
                booking_embed_url = :booking_embed_url,
                status = :status,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id'
        );

        $stmt->execute($data);

        return $this->findById($id);
    }

    public function delete(int $id): void
    {
        // Check existence
        $this->findById($id);

        $stmt = $this->pdo->prepare('DELETE FROM walk_occurrences WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
