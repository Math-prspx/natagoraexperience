<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Cache;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Logger;
use Natagora\API\Services\PlaceService;
use Natagora\API\Validators\Validator;

class AdminPlaceController
{
    private PDO $pdo;
    private PlaceService $service;
    private ?Logger $logger;
    private ?Cache $cache;

    public function __construct(PDO $pdo, ?Logger $logger = null, ?Cache $cache = null)
    {
        $this->pdo     = $pdo;
        $this->service = new PlaceService($pdo);
        $this->logger  = $logger;
        $this->cache   = $cache;
    }

    public function list(): void
    {
        $places = $this->service->findAll();
        Response::json(['items' => $places]);
    }

    public function detail(string $id): void
    {
        $place = $this->service->findById((int) $id);
        Response::json(['item' => $place]);
    }

    public function delete(string $id): void
    {
        $placeId = (int) $id;
        $this->service->delete($placeId);
        $this->logger?->info('place.deleted', ['id' => $placeId]);
        $this->cache?->delete('places');
        Response::json(['deleted' => true, 'id' => $placeId]);
    }

    public function create(): void
    {
        $payload = Router::getRequestJson();

        $name = Validator::requiredString($payload, 'name_fr');
        $slug = Validator::optionalString($payload, 'slug') ?: Validator::slugify($name);

        $specificities = Validator::normalizeSpecificities($payload);

        $data = [
            'slug' => $slug,
            'name_fr' => $name,
            'headline_fr' => Validator::optionalString($payload, 'headline_fr'),
            'short_description_fr' => Validator::optionalString($payload, 'short_description_fr'),
            'long_description_fr' => Validator::optionalString($payload, 'long_description_fr'),
            'cover_image_url' => Validator::optionalString($payload, 'cover_image_url'),
            'intro_image_url' => Validator::optionalString($payload, 'intro_image_url'),
            'metric_map_value' => Validator::optionalString($payload, 'metric_map_value'),
            'area_ha' => Validator::optionalInt($payload, 'area_ha'),
            'created_year' => Validator::optionalInt($payload, 'created_year'),
            'specificities_json' => !empty($specificities) ? json_encode($specificities) : null,
            'accordion1_title' => Validator::optionalString($payload, 'accordion1_title'),
            'accordion1_text'  => Validator::optionalString($payload, 'accordion1_text'),
            'accordion2_title' => Validator::optionalString($payload, 'accordion2_title'),
            'accordion2_text'  => Validator::optionalString($payload, 'accordion2_text'),
        ];

        $place = $this->service->create($data);
        $this->logger?->info('place.created', ['id' => $place['id'], 'slug' => $place['slug']]);
        $this->cache?->delete('places');
        Response::json(['item' => $place], 201);
    }

    public function update(string $id): void
    {
        $placeId = (int) $id;
        $payload = Router::getRequestJson();

        $name = Validator::requiredString($payload, 'name_fr');
        $slug = Validator::optionalString($payload, 'slug') ?: Validator::slugify($name);

        $specificities = Validator::normalizeSpecificities($payload);

        $data = [
            'slug' => $slug,
            'name_fr' => $name,
            'headline_fr' => Validator::optionalString($payload, 'headline_fr'),
            'short_description_fr' => Validator::optionalString($payload, 'short_description_fr'),
            'long_description_fr' => Validator::optionalString($payload, 'long_description_fr'),
            'cover_image_url' => Validator::optionalString($payload, 'cover_image_url'),
            'intro_image_url' => Validator::optionalString($payload, 'intro_image_url'),
            'metric_map_value' => Validator::optionalString($payload, 'metric_map_value'),
            'area_ha' => Validator::optionalInt($payload, 'area_ha'),
            'created_year' => Validator::optionalInt($payload, 'created_year'),
            'specificities_json' => !empty($specificities) ? json_encode($specificities) : null,
            'accordion1_title' => Validator::optionalString($payload, 'accordion1_title'),
            'accordion1_text'  => Validator::optionalString($payload, 'accordion1_text'),
            'accordion2_title' => Validator::optionalString($payload, 'accordion2_title'),
            'accordion2_text'  => Validator::optionalString($payload, 'accordion2_text'),
        ];

        $place = $this->service->update($placeId, $data);
        $this->logger?->info('place.updated', ['id' => $placeId, 'slug' => $place['slug']]);
        $this->cache?->delete('places');
        Response::json(['item' => $place]);
    }
}
