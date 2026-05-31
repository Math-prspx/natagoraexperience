<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use Natagora\API\Response;
use Natagora\API\Services\ImageService;
use Natagora\API\Exceptions\ValidationException;

class AdminImageController
{
    private ImageService $service;

    public function __construct(string $uploadDir)
    {
        $this->service = new ImageService($uploadDir);
    }

    public function upload(): void
    {
        if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
            throw new ValidationException('Aucun fichier image recu.');
        }

        $url = $this->service->upload($_FILES['image']);

        Response::json([
            'item' => [
                'url' => $url,
            ],
        ], 201);
    }
}
