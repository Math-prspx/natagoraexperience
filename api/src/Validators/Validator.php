<?php

declare(strict_types=1);

namespace Natagora\API\Validators;

use Natagora\API\Exceptions\ValidationException;

class Validator
{
    public static function requiredString(array $payload, string $key): string
    {
        $value = trim((string) ($payload[$key] ?? ''));
        if ($value === '') {
            throw new ValidationException(sprintf('Le champ "%s" est obligatoire.', $key));
        }
        return $value;
    }

    public static function optionalString(array $payload, string $key): ?string
    {
        if (!array_key_exists($key, $payload)) {
            return null;
        }

        $value = trim((string) $payload[$key]);
        return $value === '' ? null : $value;
    }

    public static function optionalInt(array $payload, string $key): ?int
    {
        if (!array_key_exists($key, $payload)) {
            return null;
        }

        $value = $payload[$key];
        if ($value === '' || $value === null) {
            return null;
        }

        return (int) $value;
    }

    public static function optionalFloat(array $payload, string $key): ?float
    {
        if (!array_key_exists($key, $payload)) {
            return null;
        }

        $value = $payload[$key];
        if ($value === '' || $value === null) {
            return null;
        }

        return (float) $value;
    }

    public static function optionalBool(array $payload, string $key): ?bool
    {
        if (!array_key_exists($key, $payload)) {
            return null;
        }

        $value = $payload[$key];
        if ($value === '' || $value === null) {
            return null;
        }

        return (bool) $value;
    }

    public static function normalizeStringList(array $payload, string $key): array
    {
        $value = $payload[$key] ?? [];
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(static function ($item): string {
            return trim((string) $item);
        }, $value), static function ($item): bool {
            return $item !== '';
        }));
    }

    public static function normalizeSpecificities(array $payload, string $key = 'specificities'): array
    {
        $value = $payload[$key] ?? [];
        if (!is_array($value)) {
            return [];
        }

        $items = [];
        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }

            $image = trim((string) ($item['image'] ?? ''));
            $title = trim((string) ($item['title'] ?? ''));
            $text = trim((string) ($item['text'] ?? ''));
            if ($image === '' && $title === '' && $text === '') {
                continue;
            }

            $items[] = [
                'image' => $image,
                'title' => $title,
                'text' => $text,
            ];
        }

        return $items;
    }

    public static function slugify(string $text): string
    {
        $text = trim($text);
        if ($text === '') {
            return 'item';
        }

        // 1. Translittération via intl si disponible (le plus propre)
        if (function_exists('transliterator_transliterate')) {
            $transliterated = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $text);
            if (is_string($transliterated) && $transliterated !== '') {
                $text = $transliterated;
            }
        } else {
            // 2. Fallback: table de remplacement explicite (portable, pas de dépendance à iconv
            //    qui produit des apostrophes parasites sur Windows).
            $map = [
                'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A', 'Æ' => 'AE',
                'Ç' => 'C',
                'È' => 'E', 'É' => 'E', 'Ê' => 'E', 'Ë' => 'E',
                'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I',
                'Ñ' => 'N',
                'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O', 'Ø' => 'O', 'Œ' => 'OE',
                'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U',
                'Ý' => 'Y', 'Ÿ' => 'Y',
                'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'æ' => 'ae',
                'ç' => 'c',
                'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
                'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
                'ñ' => 'n',
                'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o', 'œ' => 'oe',
                'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
                'ý' => 'y', 'ÿ' => 'y',
                'ß' => 'ss',
            ];
            $text = strtr($text, $map);
            $text = strtolower($text);
        }

        $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
        $text = trim($text, '-');

        return $text !== '' ? $text : 'item';
    }
}
