CREATE TABLE families (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    label_fr VARCHAR(100) NOT NULL,
    is_product TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subcategories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(140) NOT NULL UNIQUE,
    name_fr VARCHAR(140) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE places (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(140) NOT NULL UNIQUE,
    name_fr VARCHAR(160) NOT NULL,
    headline_fr VARCHAR(180) NULL,
    short_description_fr TEXT NULL,
    long_description_fr MEDIUMTEXT NULL,
    cover_image_url VARCHAR(500) NULL,
    metric_map_label VARCHAR(120) NULL,
    metric_map_value VARCHAR(180) NULL,
    area_ha INT NULL,
    created_year INT NULL,
    species_count INT NULL,
    specificities_json JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE walks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    family_id INT UNSIGNED NOT NULL,
    subcategory_id INT UNSIGNED NULL,
    place_id INT UNSIGNED NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    title VARCHAR(180) NOT NULL,
    summary TEXT NULL,
    description MEDIUMTEXT NULL,
    dates_subtitle VARCHAR(180) NULL,
    duration_minutes INT NULL,
    level_label VARCHAR(100) NULL,
    distance_km DECIMAL(6,2) NULL,
    target_public VARCHAR(180) NULL,
    practical_info_json JSON NULL,
    pmr_accessible TINYINT(1) NULL,
    min_age INT NULL,
    price_label VARCHAR(100) NULL,
    cover_image_url VARCHAR(500) NULL,
    content_image_url VARCHAR(500) NULL,
    gallery_json JSON NULL,
    booking_mode ENUM('link','iframe','hybrid') NOT NULL DEFAULT 'link',
    booking_url VARCHAR(500) NULL,
    booking_embed_url VARCHAR(500) NULL,
    status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_walk_family FOREIGN KEY (family_id) REFERENCES families(id),
    CONSTRAINT fk_walk_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    CONSTRAINT fk_walk_place FOREIGN KEY (place_id) REFERENCES places(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE walk_occurrences (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    walk_id INT UNSIGNED NOT NULL,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NULL,
    max_capacity INT NULL,
    available_capacity INT NULL,
    booking_url VARCHAR(500) NULL,
    booking_embed_url VARCHAR(500) NULL,
    status ENUM('draft','published','cancelled') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_occurrence_walk FOREIGN KEY (walk_id) REFERENCES walks(id) ON DELETE CASCADE,
    INDEX idx_occurrences_starts_at (starts_at),
    INDEX idx_occurrences_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
