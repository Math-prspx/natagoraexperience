<?php

declare(strict_types=1);

namespace Natagora\API\Services;

use PDO;
use Natagora\API\Exceptions\NotFoundException;

class SubcategoryService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findAll(): array
    {
        return $this->pdo->query(
            'SELECT id, slug, name_fr, created_at
            FROM subcategories
            ORDER BY name_fr ASC'
        )->fetchAll();
    }

    public function findAllWithCounts(): array
    {
        return $this->pdo->query(
            'SELECT
                sc.id,
                sc.slug,
                sc.name_fr,
                sc.created_at,
                COUNT(w.id) AS walk_count
            FROM subcategories sc
            LEFT JOIN walks w ON w.subcategory_id = sc.id
            GROUP BY sc.id
            ORDER BY sc.name_fr ASC'
        )->fetchAll();
    }

    public function findById(int $id): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, slug, name_fr, created_at
            FROM subcategories
            WHERE id = :id
            LIMIT 1'
        );

        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            throw new NotFoundException('Catégorie introuvable.');
        }

        return $row;
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO subcategories (slug, name_fr, created_at)
            VALUES (:slug, :name_fr, CURRENT_TIMESTAMP)'
        );

        $stmt->execute($data);
        $id = (int) $this->pdo->lastInsertId();

        return $this->findById($id);
    }

    public function update(int $id, array $data): array
    {
        $data['id'] = $id;

        $stmt = $this->pdo->prepare(
            'UPDATE subcategories SET
                slug = :slug,
                name_fr = :name_fr
            WHERE id = :id'
        );

        $stmt->execute($data);

        return $this->findById($id);
    }

    public function delete(int $id): void
    {
        // Check if used by any walks
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) AS cnt FROM walks WHERE subcategory_id = :id'
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        if ($row && (int) $row['cnt'] > 0) {
            Response::json([
                'error' => 'Impossible de supprimer cette catégorie car elle est utilisée par des promenades.'
            ], 422);
        }

        $stmt = $this->pdo->prepare('DELETE FROM subcategories WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
