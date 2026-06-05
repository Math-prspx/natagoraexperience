<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Cache;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Logger;
use Natagora\API\Services\WalkService;
use Natagora\API\Validators\Validator;
use Natagora\API\Exceptions\ValidationException;

class AdminWalkController
{
    private PDO $pdo;
    private WalkService $service;
    private ?Logger $logger;
    private ?Cache $cache;

    public function __construct(PDO $pdo, ?Logger $logger = null, ?Cache $cache = null)
    {
        $this->pdo     = $pdo;
        $this->service = new WalkService($pdo);
        $this->logger  = $logger;
        $this->cache   = $cache;
    }

    public function list(): void
    {
        $walks = $this->service->findAll();
        Response::json(['items' => $walks]);
    }

    public function detail(string $id): void
    {
        $walk = $this->service->findById((int) $id);
        Response::json(['item' => $walk]);
    }

    public function create(): void
    {
        $payload = Router::getRequestJson();

        $familyCode = Validator::requiredString($payload, 'family_code');
        $familyId = $this->service->getFamilyIdByCode($familyCode);
        
        if ($familyId === null) {
            throw new ValidationException('Famille invalide.');
        }

        $title = Validator::requiredString($payload, 'title');
        $slug = Validator::optionalString($payload, 'slug') ?: Validator::slugify($title);

        $gallery = Validator::normalizeStringList($payload, 'gallery');
        $practicalInfo = Validator::normalizeStringList($payload, 'practical_info');

        $data = [
            'family_id' => $familyId,
            'subcategory_id' => Validator::optionalInt($payload, 'subcategory_id'),
            'place_id' => Validator::optionalInt($payload, 'place_id'),
            'slug' => $slug,
            'title' => $title,
            'summary' => Validator::optionalString($payload, 'summary'),
            'description' => Validator::optionalString($payload, 'description'),
            'dates_subtitle' => Validator::optionalString($payload, 'dates_subtitle'),
            'duration_minutes' => Validator::optionalInt($payload, 'duration_minutes'),
            'level_label' => Validator::optionalString($payload, 'level_label'),
            'distance_km' => Validator::optionalFloat($payload, 'distance_km'),
            'target_public' => Validator::optionalString($payload, 'target_public'),
            'practical_info_json' => !empty($practicalInfo) ? json_encode($practicalInfo) : null,
            'pmr_accessible' => Validator::optionalBool($payload, 'pmr_accessible') ? 1 : 0,
            'min_age' => Validator::optionalInt($payload, 'min_age'),
            'price_label' => Validator::optionalString($payload, 'price_label'),
            'cover_image_url' => Validator::optionalString($payload, 'cover_image_url'),
            'intro_image_url' => Validator::optionalString($payload, 'intro_image_url'),
            'gallery_json' => !empty($gallery) ? json_encode($gallery) : null,
            'booking_mode' => Validator::optionalString($payload, 'booking_mode') ?: 'link',
            'booking_url' => Validator::optionalString($payload, 'booking_url'),
            'booking_embed_url' => Validator::optionalString($payload, 'booking_embed_url'),
            'status' => Validator::optionalString($payload, 'status') ?: 'draft',
        ];

        $walk = $this->service->create($data);
        $this->logger?->info('walk.created', ['id' => $walk['id'], 'slug' => $walk['slug']]);
        $this->cache?->invalidateGroup('walks');
        Response::json(['item' => $walk], 201);
    }

    public function update(string $id): void
    {
        $walkId = (int) $id;
        $payload = Router::getRequestJson();

        $familyCode = Validator::requiredString($payload, 'family_code');
        $familyId = $this->service->getFamilyIdByCode($familyCode);
        
        if ($familyId === null) {
            throw new ValidationException('Famille invalide.');
        }

        $title = Validator::requiredString($payload, 'title');
        $slug = Validator::optionalString($payload, 'slug') ?: Validator::slugify($title);

        $gallery = Validator::normalizeStringList($payload, 'gallery');
        $practicalInfo = Validator::normalizeStringList($payload, 'practical_info');

        $data = [
            'family_id' => $familyId,
            'subcategory_id' => Validator::optionalInt($payload, 'subcategory_id'),
            'place_id' => Validator::optionalInt($payload, 'place_id'),
            'slug' => $slug,
            'title' => $title,
            'summary' => Validator::optionalString($payload, 'summary'),
            'description' => Validator::optionalString($payload, 'description'),
            'dates_subtitle' => Validator::optionalString($payload, 'dates_subtitle'),
            'duration_minutes' => Validator::optionalInt($payload, 'duration_minutes'),
            'level_label' => Validator::optionalString($payload, 'level_label'),
            'distance_km' => Validator::optionalFloat($payload, 'distance_km'),
            'target_public' => Validator::optionalString($payload, 'target_public'),
            'practical_info_json' => !empty($practicalInfo) ? json_encode($practicalInfo) : null,
            'pmr_accessible' => Validator::optionalBool($payload, 'pmr_accessible') ? 1 : 0,
            'min_age' => Validator::optionalInt($payload, 'min_age'),
            'price_label' => Validator::optionalString($payload, 'price_label'),
            'cover_image_url' => Validator::optionalString($payload, 'cover_image_url'),
            'intro_image_url' => Validator::optionalString($payload, 'intro_image_url'),
            'gallery_json' => !empty($gallery) ? json_encode($gallery) : null,
            'booking_mode' => Validator::optionalString($payload, 'booking_mode') ?: 'link',
            'booking_url' => Validator::optionalString($payload, 'booking_url'),
            'booking_embed_url' => Validator::optionalString($payload, 'booking_embed_url'),
            'status' => Validator::optionalString($payload, 'status') ?: 'draft',
        ];

        $walk = $this->service->update($walkId, $data);
        $this->logger?->info('walk.updated', ['id' => $walkId, 'slug' => $walk['slug']]);
        $this->cache?->invalidateGroup('walks');
        $this->cache?->delete(Cache::makeKey('walk', $walk['slug']));
        Response::json(['item' => $walk]);
    }

    public function delete(string $id): void
    {
        $walkId = (int) $id;
        $walk = $this->service->findById($walkId);

        $this->service->delete($walkId);
        $this->logger?->info('walk.deleted', ['id' => $walkId, 'slug' => $walk['slug']]);
        $this->cache?->invalidateGroup('walks');
        $this->cache?->delete(Cache::makeKey('walk', $walk['slug']));

        Response::json([
            'deleted' => true,
            'id' => $walkId,
        ]);
    }
}
