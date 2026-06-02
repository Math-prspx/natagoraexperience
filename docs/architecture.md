# Architecture catalogue Natagora

## Objectif
Transformer la landing en catalogue dynamique avec creation de promenades via admin securise.

## Choix techniques
- Backend: API PHP 8.1+ / PSR-4 autoload / PDO
- Base de donnees: MySQL (prod OVH) / SQLite (dev local)
- Front public: pages HTML/JS vanilla dynamiques
- Admin: pages HTML/JS securisees (auth HMAC-SHA256)
- Reservation: mode `link`, `iframe` ou `hybrid` (recommande)
- Migrations: auto-run au demarrage, versionnees, MySQL-compatible

## Domaines fonctionnels
- Familles fixes: `decouverte`, `thematique`, `sur-mesure`
- Produits reservables: `decouverte`, `thematique`
- `sur-mesure`: redirection vers contact
- Une promenade peut posseder plusieurs occurrences (dates)
- Une reserve peut avoir jusqu a 2 sections accordeon (Faune/Flore, Acces...)

## Architecture layers
```
Public Frontend (HTML/JS)
    ↓ API REST JSON (Bearer token pour admin)
Controllers (routing + validation)
    ↓
Services (logique metier)
    ↓ PDO prepared statements
Database (MySQL / SQLite)
```

## Surface API verifiee localement
- Public: `GET /health`, `GET /public/families`, `GET /public/subcategories`, `GET /public/places`, `GET /public/walks`, `GET /public/walks/{slug}`
- Auth: `POST /admin/login`
- Admin meta: `GET /admin/meta`, `GET /admin/families`
- Admin sous-categories: `GET /admin/subcategories`, `POST /admin/subcategories`, `POST /admin/subcategories/{id}`, `DELETE /admin/subcategories/{id}`
- Admin reserves: `GET /admin/places`, `GET /admin/places/{id}`, `POST /admin/places`, `POST /admin/places/{id}`, `DELETE /admin/places/{id}`
- Admin promenades: `GET /admin/walks`, `GET /admin/walks/{id}`, `POST /admin/walks`, `POST /admin/walks/{id}`, `DELETE /admin/walks/{id}`
- Admin occurrences: `GET /admin/walk-occurrences`, `POST /admin/walk-occurrences`, `POST /admin/walk-occurrences/{id}`, `DELETE /admin/walk-occurrences/{id}`
- Admin images: `POST /admin/upload-image`

## Ecarts doc/code a garder en tete
- `POST /admin/login` retourne actuellement seulement `token`.
- `POST /admin/upload-image` retourne `item.url` et `item.thumb_url`.

## Evolutivite prevue
- Ajout i18n possible via colonnes `_fr` existantes
- Ajout media manager avance
- Ajout comptes utilisateurs / favoris
- Synchronisation capacites Billetweb

## Addendum front - 02/06/2026

Evolution UI/CSS verifiee sur les pages publiques (sans changement backend):

- Variantes hero dediees introduites: `content-hero-surmesure`, `content-hero-apropos`, `content-hero-pratique`.
- Uniformisation progressive de sections en layout split 50/50 (`sm-split`) sur pages contenu.
- Passage des metriques reserve-detail a des icones image (plus de placeholders texte `~`, `Cal`, `Map`).
- Passage des badges famille catalogue a des icones blanches avec normalisation d URL cote JS.
- Ajustements de densite visuelle (espacements cartes catalogue, sections reserves, cartes ressources homepage).

Contraintes de deploiement front:

- Les assets images references doivent etre alignes entre `img/` et `deploy/img/`.
- Attention a la casse des noms de fichier image en environnement Linux (serveur web case-sensitive).
