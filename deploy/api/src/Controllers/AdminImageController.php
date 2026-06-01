<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use Natagora\API\Response;
use Natagora\API\Logger;
use Natagora\API\Services\ImageService;
use Natagora\API\Exceptions\ValidationException;

class AdminImageController
{
    private ImageService $service;
    private ?Logger $logger;

    public function __construct(string $uploadDir, ?Logger $logger = null)
    {
        $this->service = new ImageService($uploadDir);
        $this->logger  = $logger;
    }

    public function upload(): void
    {
        if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
            throw new ValidationException('Aucun fichier image recu.');
        }

        $result = $this->service->upload($_FILES['image']);
        $this->logger?->info('image.uploaded', ['url' => $result['url'], 'thumb_url' => $result['thumb_url']]);

        Response::json([
            'item' => [
                'url'       => $result['url'],
                'thumb_url' => $result['thumb_url'],
            ],
        ], 201);
    }
}
