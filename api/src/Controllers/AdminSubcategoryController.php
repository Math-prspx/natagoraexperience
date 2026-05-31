<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Services\SubcategoryService;
use Natagora\API\Validators\Validator;

class AdminSubcategoryController
{
    private PDO $pdo;
    private SubcategoryService $service;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->service = new SubcategoryService($pdo);
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
        Response::json(['item' => $item]);
    }

    public function delete(string $id): void
    {
        $subcategoryId = (int) $id;
        $this->service->delete($subcategoryId);

        Response::json([
            'deleted' => true,
            'id' => $subcategoryId,
        ]);
    }
}
