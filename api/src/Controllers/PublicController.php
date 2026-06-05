<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Cache;
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
    private ?Cache $cache;

    public function __construct(PDO $pdo, ?Cache $cache = null)
    {
        $this->pdo = $pdo;
        $this->walkService = new WalkService($pdo);
        $this->placeService = new PlaceService($pdo);
        $this->subcategoryService = new SubcategoryService($pdo);
        $this->cache = $cache;
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
        $key = 'families';
        if ($this->cache && ($cached = $this->cache->get($key)) !== null) {
            Response::json(['items' => $cached]);
            return;
        }

        $rows = $this->pdo->query(
            'SELECT id, code, label_fr, is_product FROM families ORDER BY id ASC'
        )->fetchAll();

        $this->cache?->set($key, $rows);
        Response::json(['items' => $rows]);
    }

    public function subcategories(): void
    {
        $key = 'subcategories';
        if ($this->cache && ($cached = $this->cache->get($key)) !== null) {
            Response::json(['items' => $cached]);
            return;
        }

        $items = $this->subcategoryService->findAll();
        $this->cache?->set($key, $items);
        Response::json(['items' => $items]);
    }

    public function places(): void
    {
        $key = 'places';
        if ($this->cache && ($cached = $this->cache->get($key)) !== null) {
            Response::json(['items' => $cached]);
            return;
        }

        $items = $this->placeService->findAll();
        $this->cache?->set($key, $items);
        Response::json(['items' => $items]);
    }

    public function walks(): void
    {
        $filters = [
            'family'     => trim((string) ($_GET['family'] ?? '')),
            'subcategory' => trim((string) ($_GET['subcategory'] ?? '')),
            'place'      => trim((string) ($_GET['place'] ?? '')),
            'from_date'  => trim((string) ($_GET['from_date'] ?? '')),
        ];

        $key = Cache::makeKey('walks', http_build_query($filters));
        if ($this->cache && ($cached = $this->cache->get($key)) !== null) {
            Response::json(['items' => $cached]);
            return;
        }

        $items = $this->walkService->findPublished($filters);
        $this->cache?->set($key, $items);
        Response::json(['items' => $items]);
    }

    public function walkDetail(string $slug): void
    {
        $key = Cache::makeKey('walk', $slug);
        if ($this->cache && ($cached = $this->cache->get($key)) !== null) {
            Response::json(['item' => $cached]);
            return;
        }

        $walk = $this->walkService->findBySlug($slug);
        $this->cache?->set($key, $walk);
        Response::json(['item' => $walk]);
    }
}
