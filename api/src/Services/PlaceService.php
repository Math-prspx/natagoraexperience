<?php

declare(strict_types=1);

namespace Natagora\API\Services;

use PDO;
use Natagora\API\Exceptions\NotFoundException;

class PlaceService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findAll(): array
    {
        $rows = $this->pdo->query(
            'SELECT
                id, slug, name_fr, headline_fr, short_description_fr, long_description_fr,
                cover_image_url, intro_image_url, metric_map_value,
                area_ha, created_year, specificities_json,
                accordion1_title, accordion1_text, accordion2_title, accordion2_text
            FROM places
            ORDER BY name_fr ASC'
        )->fetchAll();

        foreach ($rows as &$place) {
            $place['specificities'] = $place['specificities_json'] 
                ? json_decode((string) $place['specificities_json'], true) 
                : [];
            unset($place['specificities_json']);
        }
        unset($place);

        return $rows;
    }

    public function findById(int $id): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT
                id, slug, name_fr, headline_fr, short_description_fr, long_description_fr,
                cover_image_url, intro_image_url, metric_map_value,
                area_ha, created_year, specificities_json,
                accordion1_title, accordion1_text, accordion2_title, accordion2_text
            FROM places
            WHERE id = :id
            LIMIT 1'
        );

        $stmt->execute(['id' => $id]);
        $place = $stmt->fetch();

        if (!$place) {
            throw new NotFoundException('Réserve introuvable.');
        }

        $place['specificities'] = $place['specificities_json'] 
            ? json_decode((string) $place['specificities_json'], true) 
            : [];
        unset($place['specificities_json']);

        return $place;
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO places (
                slug, name_fr, headline_fr, short_description_fr, long_description_fr,
                cover_image_url, intro_image_url, metric_map_value,
                area_ha, created_year, specificities_json,
                accordion1_title, accordion1_text, accordion2_title, accordion2_text,
                created_at, updated_at
            ) VALUES (
                :slug, :name_fr, :headline_fr, :short_description_fr, :long_description_fr,
                :cover_image_url, :intro_image_url, :metric_map_value,
                :area_ha, :created_year, :specificities_json,
                :accordion1_title, :accordion1_text, :accordion2_title, :accordion2_text,
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
            'UPDATE places SET
                slug = :slug,
                name_fr = :name_fr,
                headline_fr = :headline_fr,
                short_description_fr = :short_description_fr,
                long_description_fr = :long_description_fr,
                cover_image_url = :cover_image_url,
                intro_image_url = :intro_image_url,
                metric_map_value = :metric_map_value,
                area_ha = :area_ha,
                created_year = :created_year,
                specificities_json = :specificities_json,
                accordion1_title = :accordion1_title,
                accordion1_text = :accordion1_text,
                accordion2_title = :accordion2_title,
                accordion2_text = :accordion2_text,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id'
        );

        $stmt->execute($data);

        return $this->findById($id);
    }

    public function delete(int $id): void
    {
        // Ensure it exists first
        $this->findById($id);

        $stmt = $this->pdo->prepare('DELETE FROM places WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
