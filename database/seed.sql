INSERT INTO families (code, label_fr, is_product, sort_order) VALUES
('decouverte', 'Découverte', 1, 1),
('thematique', 'Thématique', 1, 2),
('sur-mesure', 'Sur mesure', 0, 3);

INSERT INTO subcategories (slug, name_fr) VALUES
('botanique', 'Botanique'),
('ornithologie', 'Ornithologie');

INSERT INTO places (slug, name_fr, short_description_fr, cover_image_url) VALUES
('montagne-saint-pierre', 'Montagne Saint-Pierre', 'Réserve transfrontalière remarquable pour sa biodiversité.', 'img/Map-bgr-01.png');

INSERT INTO walks (
    family_id,
    subcategory_id,
    place_id,
    slug,
    title,
    summary,
    description,
    duration_minutes,
    level_label,
    min_age,
    price_label,
    cover_image_url,
    booking_mode,
    booking_url,
    booking_embed_url,
    status
) VALUES (
    (SELECT id FROM families WHERE code = 'thematique'),
    (SELECT id FROM subcategories WHERE slug = 'botanique'),
    (SELECT id FROM places WHERE slug = 'montagne-saint-pierre'),
    'balade-botanique-printemps',
    'Balade botanique de printemps',
    'Une promenade guidée pour explorer les plantes sauvages locales.',
    'Accompagnés par un guide, vous identifiez les espèces, leurs habitats et les gestes de protection concrets.',
    120,
    'Facile',
    10,
    'a.p.d. 9 EUR/p',
    'img/Map-bgr-01.png',
    'hybrid',
    'https://www.billetweb.fr/',
    'https://www.billetweb.fr/',
    'published'
);

INSERT INTO walk_occurrences (
    walk_id,
    starts_at,
    ends_at,
    max_capacity,
    available_capacity,
    booking_url,
    booking_embed_url,
    status
) VALUES
(
    (SELECT id FROM walks WHERE slug = 'balade-botanique-printemps'),
    '2026-06-15 10:00:00',
    '2026-06-15 12:00:00',
    20,
    20,
    'https://www.billetweb.fr/',
    'https://www.billetweb.fr/',
    'published'
),
(
    (SELECT id FROM walks WHERE slug = 'balade-botanique-printemps'),
    '2026-06-22 10:00:00',
    '2026-06-22 12:00:00',
    20,
    20,
    'https://www.billetweb.fr/',
    'https://www.billetweb.fr/',
    'published'
);
