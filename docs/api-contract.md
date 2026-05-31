# API contract (MVP)

Base path: `/api`

## Public
- `GET /health`
- `GET /public/families`
- `GET /public/subcategories`
- `GET /public/places`
- `GET /public/walks?family=&subcategory=&place=&from_date=`
- `GET /public/walks/{slug}`

## Admin (sans auth pour MVP)
- `GET /admin/meta`
- `GET /admin/subcategories`
- `POST /admin/subcategories`
- `POST /admin/subcategories/{id}`
- `DELETE /admin/subcategories/{id}`
- `POST /admin/places`
- `POST /admin/walks`
- `POST /admin/walk-occurrences`

## Notes de reservation
- `booking_mode = link` : bouton externe
- `booking_mode = iframe` : iframe dans la fiche
- `booking_mode = hybrid` : iframe + lien fallback

## Exemples payload

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
  "min_age": 10,
  "price_label": "a.p.d. 9 EUR/p",
  "cover_image_url": "img/Map-bgr-01.png",
  "booking_mode": "hybrid",
  "booking_url": "https://www.billetweb.fr/...",
  "booking_embed_url": "https://www.billetweb.fr/...",
  "status": "published",
  "gallery": []
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
