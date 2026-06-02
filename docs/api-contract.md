# API contract

Base path: `/api`  
Production: `https://www.nothuman.be/natagora/api`

## Authentification admin
Toutes les routes `/admin/*` (sauf `/admin/login`) requierent un header:
```
Authorization: Bearer <token>
```
Le token est obtenu via `POST /admin/login` et expire apres 8h.

---

## Public (GET, sans auth)
- `GET /health` - Health check `{"status":"ok"}`
- `GET /public/families` - Liste familles
- `GET /public/subcategories` - Liste categories
- `GET /public/places` - Liste reserves
- `GET /public/walks` - Liste promenades (filtres: `family`, `subcategory`, `place`, `from_date`)
- `GET /public/walks/{slug}` - Detail promenade + occurrences

---

## Auth
- `POST /admin/login` - Connexion → retourne `{"token":"..."}`

---

## Admin (auth requise)

### Meta
- `GET /admin/meta` - Familles + categories + reserves (pour selects)
- `GET /admin/families` - Familles avec compteurs

### Sous-categories
- `GET /admin/subcategories` - Liste avec compteur walks
- `POST /admin/subcategories` - Creer
- `POST /admin/subcategories/{id}` - Modifier
- `DELETE /admin/subcategories/{id}` - Supprimer

### Reserves (places)
- `GET /admin/places` - Liste toutes reserves
- `GET /admin/places/{id}` - Detail reserve
- `POST /admin/places` - Creer reserve
- `POST /admin/places/{id}` - Modifier reserve
- `DELETE /admin/places/{id}` - Supprimer reserve

### Promenades (walks)
- `GET /admin/walks` - Liste toutes promenades (hydratees)
- `GET /admin/walks/{id}` - Detail promenade
- `POST /admin/walks` - Creer promenade
- `POST /admin/walks/{id}` - Modifier promenade
- `DELETE /admin/walks/{id}` - Supprimer promenade

### Occurrences
- `GET /admin/walk-occurrences` - Liste (filtre optionnel: `walk_id`)
- `POST /admin/walk-occurrences` - Creer occurrence
- `POST /admin/walk-occurrences/{id}` - Modifier occurrence
- `DELETE /admin/walk-occurrences/{id}` - Supprimer occurrence

### Images
- `POST /admin/upload-image` - Upload image (max 8MB, jpg/png/webp/gif) → `{"item":{"url":"...","thumb_url":"..."}}`

---

## Exemples payload

### POST /admin/login
```json
{
  "username": "admin",
  "password": "motdepasse"
}
```

### POST /admin/places
```json
{
  "name_fr": "Montagne Saint-Pierre",
  "slug": "montagne-saint-pierre",
  "headline_fr": "Reserve calcaire exceptionnelle",
  "short_description_fr": "Description courte",
  "long_description_fr": "Description longue HTML",
  "cover_image_url": "assets/media/uploads/cover.jpg",
  "intro_image_url": "assets/media/uploads/intro.jpg",
  "metric_map_value": "Liege",
  "area_ha": 43,
  "created_year": 1954,
  "specificities_json": [
    {"image": "assets/media/uploads/spec1.jpg", "text": "Orchidees sauvages"}
  ],
  "accordion1_title": "Faune & Flore",
  "accordion1_text": "<p>Contenu HTML...</p>",
  "accordion2_title": "Comment acceder ?",
  "accordion2_text": "<p>Contenu HTML...</p>"
}
```

### POST /admin/walks
```json
{
  "family_code": "thematique",
  "subcategory_id": 1,
  "place_id": 1,
  "title": "Balade botanique",
  "summary": "Decouverte des plantes locales",
  "description": "Description complete",
  "dates_subtitle": "Sous titre",
  "duration_minutes": 120,
  "level_label": "Facile",
  "distance_km": 5.5,
  "target_public": "Familles",
  "min_age": 10,
  "price_label": "a.p.d. 9 EUR/p",
  "cover_image_url": "assets/media/uploads/cover.jpg",
  "intro_image_url": "assets/media/uploads/intro.jpg",
  "gallery": ["assets/media/uploads/g1.jpg"],
  "booking_mode": "hybrid",
  "booking_url": "https://www.billetweb.fr/...",
  "booking_embed_url": "https://www.billetweb.fr/...",
  "status": "published"
}
```

### POST /admin/walk-occurrences
```json
{
  "walk_id": 1,
  "starts_at": "2026-06-15 10:00:00",
  "ends_at": "2026-06-15 12:00:00",
  "max_capacity": 20,
  "available_capacity": 20,
  "booking_url": "https://www.billetweb.fr/...",
  "booking_embed_url": "https://www.billetweb.fr/...",
  "status": "published"
}
```

---

## Notes reservation
- `booking_mode = link` : bouton externe
- `booking_mode = iframe` : iframe dans la fiche
- `booking_mode = hybrid` : iframe + lien fallback (recommande)
- Les champs `booking_url` / `booking_embed_url` peuvent etre overrides au niveau occurrence
