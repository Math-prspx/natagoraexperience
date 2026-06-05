<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use PDO;
use Natagora\API\Response;
use Natagora\API\Services\SubcategoryService;
use Natagora\API\Services\PlaceService;

class AdminMetaController
{
    private PDO $pdo;
    private SubcategoryService $subcategoryService;
    private PlaceService $placeService;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->subcategoryService = new SubcategoryService($pdo);
        $this->placeService = new PlaceService($pdo);
    }

    public function meta(): void
    {
        $families = $this->pdo->query(
            'SELECT id, code, label_fr, is_product, sort_order FROM families ORDER BY sort_order ASC'
        )->fetchAll();

        $subcategories = $this->subcategoryService->findAll();
        $places = $this->placeService->findAll();

        Response::json([
            'families' => $families,
            'subcategories' => $subcategories,
            'places' => $places,
        ]);
    }

    public function families(): void
    {
        $items = $this->pdo->query(
            'SELECT
                f.id,
                f.code,
                f.label_fr,
                f.is_product,
                f.sort_order,
                COUNT(w.id) AS walk_count
            FROM families f
            LEFT JOIN walks w ON w.family_id = f.id
            GROUP BY f.id
            ORDER BY f.sort_order ASC'
        )->fetchAll();

        Response::json(['items' => $items]);
    }
}
