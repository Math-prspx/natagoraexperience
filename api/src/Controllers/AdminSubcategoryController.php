<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Cache;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Logger;
use Natagora\API\Services\SubcategoryService;
use Natagora\API\Validators\Validator;

class AdminSubcategoryController
{
    private PDO $pdo;
    private SubcategoryService $service;
    private ?Logger $logger;
    private ?Cache $cache;

    public function __construct(PDO $pdo, ?Logger $logger = null, ?Cache $cache = null)
    {
        $this->pdo     = $pdo;
        $this->service = new SubcategoryService($pdo);
        $this->logger  = $logger;
        $this->cache   = $cache;
    }

    public function list(): void
    {
        $items = $this->service->findAllWithCounts();
        Response::json(['items' => $items]);
    }

    public function create(): void
    {
        $payload = Router::getRequestJson();

        $name = Validator::requiredString($payload, 'name_fr');
        $slug = Validator::optionalString($payload, 'slug') ?: Validator::slugify($name);

        $data = [
            'slug' => $slug,
            'name_fr' => $name,
        ];

        $item = $this->service->create($data);
        $this->logger?->info('subcategory.created', ['id' => $item['id'], 'slug' => $item['slug']]);
        $this->cache?->delete('subcategories');
        Response::json(['item' => $item], 201);
    }

    public function update(string $id): void
    {
        $subcategoryId = (int) $id;
        $payload = Router::getRequestJson();

        $name = Validator::requiredString($payload, 'name_fr');
        $slug = Validator::optionalString($payload, 'slug') ?: Validator::slugify($name);

        $data = [
            'slug' => $slug,
            'name_fr' => $name,
        ];

        $item = $this->service->update($subcategoryId, $data);
        $this->logger?->info('subcategory.updated', ['id' => $subcategoryId, 'slug' => $item['slug']]);
        $this->cache?->delete('subcategories');
        Response::json(['item' => $item]);
    }

    public function delete(string $id): void
    {
        $subcategoryId = (int) $id;
        $this->service->delete($subcategoryId);
        $this->logger?->info('subcategory.deleted', ['id' => $subcategoryId]);
        $this->cache?->delete('subcategories');
        Response::json([
            'deleted' => true,
            'id' => $subcategoryId,
        ]);
    }
}
