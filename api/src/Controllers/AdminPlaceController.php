<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Services\PlaceService;
use Natagora\API\Validators\Validator;

class AdminPlaceController
{
    private PDO $pdo;
    private PlaceService $service;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->service = new PlaceService($pdo);
    }

    public function list(): void
    {
        $places = $this->service->findAll();
        Response::json(['items' => $places]);
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
            'metric_map_label' => Validator::optionalString($payload, 'metric_map_label'),
            'metric_map_value' => Validator::optionalString($payload, 'metric_map_value'),
            'area_ha' => Validator::optionalInt($payload, 'area_ha'),
            'created_year' => Validator::optionalInt($payload, 'created_year'),
            'species_count' => Validator::optionalInt($payload, 'species_count'),
            'specificities_json' => !empty($specificities) ? json_encode($specificities) : null,
        ];

        $place = $this->service->create($data);
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
            'metric_map_label' => Validator::optionalString($payload, 'metric_map_label'),
            'metric_map_value' => Validator::optionalString($payload, 'metric_map_value'),
            'area_ha' => Validator::optionalInt($payload, 'area_ha'),
            'created_year' => Validator::optionalInt($payload, 'created_year'),
            'species_count' => Validator::optionalInt($payload, 'species_count'),
            'specificities_json' => !empty($specificities) ? json_encode($specificities) : null,
        ];

        $place = $this->service->update($placeId, $data);
        Response::json(['item' => $place]);
    }
}
