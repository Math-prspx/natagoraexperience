<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Response;
use Natagora\API\Services\WalkService;
use Natagora\API\Services\PlaceService;
use Natagora\API\Services\SubcategoryService;

class PublicController
{
    private PDO $pdo;
    private WalkService $walkService;
    private PlaceService $placeService;
    private SubcategoryService $subcategoryService;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->walkService = new WalkService($pdo);
        $this->placeService = new PlaceService($pdo);
        $this->subcategoryService = new SubcategoryService($pdo);
    }

    public function index(): void
    {
        Response::json([
            'name' => 'Natagora Catalogue API',
            'version' => '0.1.0',
            'status' => 'ok',
        ]);
    }

    public function health(): void
    {
        Response::json(['status' => 'ok']);
    }

    public function families(): void
    {
        $rows = $this->pdo->query(
            'SELECT id, code, label_fr, is_product FROM families ORDER BY id ASC'
        )->fetchAll();

        Response::json(['items' => $rows]);
    }

    public function subcategories(): void
    {
        $items = $this->subcategoryService->findAll();
        Response::json(['items' => $items]);
    }

    public function places(): void
    {
        $items = $this->placeService->findAll();
        Response::json(['items' => $items]);
    }

    public function walks(): void
    {
        $filters = [
            'family' => trim((string) ($_GET['family'] ?? '')),
            'subcategory' => trim((string) ($_GET['subcategory'] ?? '')),
            'place' => trim((string) ($_GET['place'] ?? '')),
            'from_date' => trim((string) ($_GET['from_date'] ?? '')),
        ];

        $items = $this->walkService->findPublished($filters);
        Response::json(['items' => $items]);
    }

    public function walkDetail(string $slug): void
    {
        $walk = $this->walkService->findBySlug($slug);
        Response::json(['item' => $walk]);
    }
}
