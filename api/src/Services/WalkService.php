<?php

declare(strict_types=1);

namespace Natagora\API\Services;

use PDO;
use Natagora\API\Exceptions\NotFoundException;

class WalkService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findById(int $id): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT
                w.id,
                w.slug,
                w.title,
                w.summary,
                w.description,
                w.dates_subtitle,
                w.duration_minutes,
                w.level_label,
                w.distance_km,
                w.target_public,
                w.practical_info_json,
                w.pmr_accessible,
                w.min_age,
                w.price_label,
                w.cover_image_url,
                w.intro_image_url,
                w.gallery_json,
                w.booking_mode,
                w.booking_url,
                w.booking_embed_url,
                w.status,
                w.created_at,
                f.code AS family_code,
                f.label_fr AS family_label,
                sc.id AS subcategory_id,
                sc.slug AS subcategory_slug,
                sc.name_fr AS subcategory_name,
                p.id AS place_id,
                p.slug AS place_slug,
                p.name_fr AS place_name
            FROM walks w
            INNER JOIN families f ON f.id = w.family_id
            LEFT JOIN subcategories sc ON sc.id = w.subcategory_id
            LEFT JOIN places p ON p.id = w.place_id
            WHERE w.id = :id
            LIMIT 1'
        );

        $stmt->execute(['id' => $id]);
        $walk = $stmt->fetch();

        if (!$walk) {
            throw new NotFoundException('Promenade introuvable.');
        }

        return $this->hydrateWalk($walk);
    }

    public function findBySlug(string $slug): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT
                w.id,
                w.slug,
                w.title,
                w.summary,
                w.description,
                w.dates_subtitle,
                w.duration_minutes,
                w.level_label,
                w.distance_km,
                w.target_public,
                w.practical_info_json,
                w.pmr_accessible,
                w.min_age,
                w.price_label,
                w.cover_image_url,
                w.intro_image_url,
                w.gallery_json,
                w.booking_mode,
                w.booking_url,
                w.booking_embed_url,
                w.status,
                w.created_at,
                f.code AS family_code,
                f.label_fr AS family_label,
                sc.id AS subcategory_id,
                sc.slug AS subcategory_slug,
                sc.name_fr AS subcategory_name,
                p.id AS place_id,
                p.slug AS place_slug,
                p.name_fr AS place_name
            FROM walks w
            INNER JOIN families f ON f.id = w.family_id
            LEFT JOIN subcategories sc ON sc.id = w.subcategory_id
            LEFT JOIN places p ON p.id = w.place_id
            WHERE w.slug = :slug
            LIMIT 1'
        );

        $stmt->execute(['slug' => $slug]);
        $walk = $stmt->fetch();

        if (!$walk) {
            throw new NotFoundException('Promenade introuvable.');
        }

        return $this->hydrateWalk($walk);
    }

    public function findAll(): array
    {
        $stmt = $this->pdo->query(
            'SELECT
                w.id,
                w.slug,
                w.title,
                w.summary,
                w.description,
                w.dates_subtitle,
                w.duration_minutes,
                w.level_label,
                w.distance_km,
                w.target_public,
                w.practical_info_json,
                w.pmr_accessible,
                w.min_age,
                w.price_label,
                w.cover_image_url,
                w.intro_image_url,
                w.gallery_json,
                w.booking_mode,
                w.booking_url,
                w.booking_embed_url,
                w.status,
                w.created_at,
                f.code AS family_code,
                f.label_fr AS family_label,
                sc.id AS subcategory_id,
                sc.slug AS subcategory_slug,
                sc.name_fr AS subcategory_name,
                p.id AS place_id,
                p.slug AS place_slug,
                p.name_fr AS place_name
            FROM walks w
            INNER JOIN families f ON f.id = w.family_id
            LEFT JOIN subcategories sc ON sc.id = w.subcategory_id
            LEFT JOIN places p ON p.id = w.place_id
            ORDER BY w.created_at DESC, w.id DESC'
        );

        $walks = $stmt->fetchAll();

        // Eager load all occurrences in one query
        return $this->hydrateWalksBatch($walks);
    }

    public function findPublished(array $filters = []): array
    {
        $sql = 'SELECT
                w.id,
                w.slug,
                w.title,
                w.summary,
                w.duration_minutes,
                w.level_label,
                w.price_label,
                w.cover_image_url,
                w.booking_mode,
                f.code AS family_code,
                f.label_fr AS family_label,
                sc.slug AS subcategory_slug,
                sc.name_fr AS subcategory_name,
                p.slug AS place_slug,
                p.name_fr AS place_name,
                MIN(wo.starts_at) AS next_date
            FROM walks w
            INNER JOIN families f ON f.id = w.family_id
            LEFT JOIN subcategories sc ON sc.id = w.subcategory_id
            LEFT JOIN places p ON p.id = w.place_id
            LEFT JOIN walk_occurrences wo ON wo.walk_id = w.id AND wo.status = \'published\'
            WHERE w.status = \'published\'';

        $params = [];

        $applyInFilter = function (string $rawValue, string $column, string $prefix) use (&$sql, &$params): void {
            $parts = array_values(array_filter(array_map('trim', explode(',', $rawValue)), 'strlen'));
            if (empty($parts)) {
                return;
            }
            $placeholders = [];
            foreach ($parts as $i => $value) {
                $key = $prefix . $i;
                $placeholders[] = ':' . $key;
                $params[$key] = $value;
            }
            $sql .= ' AND ' . $column . ' IN (' . implode(', ', $placeholders) . ')';
        };

        if (!empty($filters['family'])) {
            $applyInFilter((string) $filters['family'], 'f.code', 'family_');
        }

        if (!empty($filters['subcategory'])) {
            $applyInFilter((string) $filters['subcategory'], 'sc.slug', 'subcategory_');
        }

        if (!empty($filters['place'])) {
            $applyInFilter((string) $filters['place'], 'p.slug', 'place_');
        }

        if (!empty($filters['from_date'])) {
            $sql .= ' AND (wo.starts_at IS NULL OR wo.starts_at >= :date_from)';
            $params['date_from'] = $filters['from_date'];
        }

        $sql .= ' GROUP BY w.id ORDER BY next_date IS NULL, next_date ASC, w.title ASC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function create(array $data): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO walks (
                family_id, subcategory_id, place_id, slug, title, summary, description,
                dates_subtitle, duration_minutes, level_label, distance_km, target_public,
                practical_info_json, pmr_accessible, min_age, price_label,
                cover_image_url, intro_image_url, gallery_json,
                booking_mode, booking_url, booking_embed_url, status,
                created_at, updated_at
            ) VALUES (
                :family_id, :subcategory_id, :place_id, :slug, :title, :summary, :description,
                :dates_subtitle, :duration_minutes, :level_label, :distance_km, :target_public,
                :practical_info_json, :pmr_accessible, :min_age, :price_label,
                :cover_image_url, :intro_image_url, :gallery_json,
                :booking_mode, :booking_url, :booking_embed_url, :status,
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
            'UPDATE walks SET
                family_id = :family_id,
                subcategory_id = :subcategory_id,
                place_id = :place_id,
                slug = :slug,
                title = :title,
                summary = :summary,
                description = :description,
                dates_subtitle = :dates_subtitle,
                duration_minutes = :duration_minutes,
                level_label = :level_label,
                distance_km = :distance_km,
                target_public = :target_public,
                practical_info_json = :practical_info_json,
                pmr_accessible = :pmr_accessible,
                min_age = :min_age,
                price_label = :price_label,
                cover_image_url = :cover_image_url,
                intro_image_url = :intro_image_url,
                gallery_json = :gallery_json,
                booking_mode = :booking_mode,
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
        $this->findById($id);

        $stmt = $this->pdo->prepare('DELETE FROM walks WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    private function hydrateWalk(array $walk): array
    {
        // Load occurrences
        $occ = $this->pdo->prepare(
            'SELECT
                id,
                starts_at,
                ends_at,
                guide_name,
                max_capacity,
                available_capacity,
                booking_url,
                booking_embed_url,
                status
            FROM walk_occurrences
            WHERE walk_id = :walk_id
            ORDER BY starts_at ASC'
        );

        $occ->execute(['walk_id' => $walk['id']]);
        $walk['occurrences'] = $occ->fetchAll();

        // Decode JSON fields
        $walk['gallery'] = $walk['gallery_json'] ? json_decode($walk['gallery_json'], true) : [];
        $walk['practical_info'] = $walk['practical_info_json'] ? json_decode((string) $walk['practical_info_json'], true) : [];
        
        if (!is_array($walk['practical_info'])) {
            $walk['practical_info'] = [];
        }

        $walk['pmr_accessible'] = $walk['pmr_accessible'] === null ? null : ((int) $walk['pmr_accessible'] === 1);

        unset($walk['gallery_json']);
        unset($walk['practical_info_json']);

        return $walk;
    }

    /**
     * Hydrate multiple walks with eager-loaded occurrences (batch loading to avoid N+1).
     */
    private function hydrateWalksBatch(array $walks): array
    {
        if (empty($walks)) {
            return [];
        }

        // Extract all walk IDs
        $walkIds = array_column($walks, 'id');

        // Load all occurrences in one query
        $placeholders = implode(',', array_fill(0, count($walkIds), '?'));
        $occStmt = $this->pdo->prepare(
            "SELECT
                walk_id,
                id,
                starts_at,
                ends_at,
                guide_name,
                max_capacity,
                available_capacity,
                booking_url,
                booking_embed_url,
                status
            FROM walk_occurrences
            WHERE walk_id IN ($placeholders)
            ORDER BY walk_id ASC, starts_at ASC"
        );
        $occStmt->execute($walkIds);
        $allOccurrences = $occStmt->fetchAll();

        // Group occurrences by walk_id
        $occurrencesByWalkId = [];
        foreach ($allOccurrences as $occ) {
            $occurrencesByWalkId[$occ['walk_id']][] = $occ;
        }

        // Hydrate each walk with its occurrences and decode JSON
        foreach ($walks as &$walk) {
            $walk['occurrences'] = $occurrencesByWalkId[$walk['id']] ?? [];

            // Remove walk_id from occurrences (cleanup)
            foreach ($walk['occurrences'] as &$occ) {
                unset($occ['walk_id']);
            }
            unset($occ);

            // Decode JSON fields
            $walk['gallery'] = $walk['gallery_json'] ? json_decode($walk['gallery_json'], true) : [];
            $walk['practical_info'] = $walk['practical_info_json'] ? json_decode((string) $walk['practical_info_json'], true) : [];
            
            if (!is_array($walk['practical_info'])) {
                $walk['practical_info'] = [];
            }

            $walk['pmr_accessible'] = $walk['pmr_accessible'] === null ? null : ((int) $walk['pmr_accessible'] === 1);

            unset($walk['gallery_json']);
            unset($walk['practical_info_json']);
        }
        unset($walk);

        return $walks;
    }

    public function getFamilyIdByCode(string $code): ?int
    {
        $stmt = $this->pdo->prepare('SELECT id FROM families WHERE code = :code LIMIT 1');
        $stmt->execute(['code' => $code]);
        $row = $stmt->fetch();

        return $row ? (int) $row['id'] : null;
    }
}
