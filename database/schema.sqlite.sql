PRAGMA foreign_keys = ON;

CREATE TABLE families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    label_fr TEXT NOT NULL,
    is_product INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name_fr TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name_fr TEXT NOT NULL,
    headline_fr TEXT,
    short_description_fr TEXT,
    long_description_fr TEXT,
    cover_image_url TEXT,
    metric_map_label TEXT,
    metric_map_value TEXT,
    area_ha INTEGER,
    created_year INTEGER,
    species_count INTEGER,
    specificities_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE walks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    subcategory_id INTEGER,
    place_id INTEGER,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    dates_subtitle TEXT,
    duration_minutes INTEGER,
    level_label TEXT,
    distance_km REAL,
    target_public TEXT,
    practical_info_json TEXT,
    pmr_accessible INTEGER,
    min_age INTEGER,
    price_label TEXT,
    cover_image_url TEXT,
    content_image_url TEXT,
    gallery_json TEXT,
    booking_mode TEXT NOT NULL DEFAULT 'link' CHECK (booking_mode IN ('link', 'iframe', 'hybrid')),
    booking_url TEXT,
    booking_embed_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    FOREIGN KEY (place_id) REFERENCES places(id)
);

CREATE TABLE walk_occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    walk_id INTEGER NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT,
    max_capacity INTEGER,
    available_capacity INTEGER,
    booking_url TEXT,
    booking_embed_url TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (walk_id) REFERENCES walks(id) ON DELETE CASCADE
);

CREATE INDEX idx_occurrences_starts_at ON walk_occurrences(starts_at);
CREATE INDEX idx_occurrences_status ON walk_occurrences(status);
