# Natagora Xperience - Checkpoint de Référence

**Date**: Mai 2026  
**Version**: MVP v4  
**Client**: Natagora  
**Type**: Plateforme de catalogue et réservation d'expériences nature

---

## 🎯 Vue d'ensemble

Plateforme MVP pour transformer la page statique Natagora en catalogue dynamique de promenades guidées dans des réserves naturelles. Système de gestion complet avec interface publique et administration.

**3 familles de produits**:
- **Découverte**: Promenades d'initiation
- **Thématique**: Sorties spécialisées (botanique, ornithologie, etc.)
- **Sur-mesure**: Expériences personnalisées (contact direct)

---

## 🏗️ Architecture Technique

### Stack
- **Backend**: PHP 8.0+ / REST API / PDO
- **Base de données**: MySQL (prod) / SQLite (dev local)
- **Frontend**: HTML5 / CSS3 / Vanilla JavaScript ES6+
- **Hébergement**: OVH shared hosting

### Structure
```
Public Frontend (HTML/JS) 
    ↓ API REST (JSON)
API PHP (/api/index.php)
    ↓ SQL (PDO)
Database (MySQL/SQLite)

Admin Frontend (HTML/JS séparé)
```

---

## 📁 Fichiers Clés

### Backend
- `router.php` - Routeur PHP dev server
- `api/index.php` - Point d'entrée API (~130 lignes, refactorisé)
- `api/index.old.php` - Backup ancien code monolithique (1500 lignes)
- `api/src/Router.php` - Système de routing orienté objet
- `api/src/Database.php` - Connexion PDO
- `api/src/Response.php` - Réponses JSON
- `api/src/DatabaseMigrations.php` - Migrations helper
- `api/config.php` - Configuration DB

**Contrôleurs** (logique routing):
- `api/src/Controllers/PublicController.php` - Routes publiques
- `api/src/Controllers/AdminMetaController.php` - Meta/familles
- `api/src/Controllers/AdminWalkController.php` - CRUD promenades
- `api/src/Controllers/AdminPlaceController.php` - CRUD réserves
- `api/src/Controllers/AdminSubcategoryController.php` - CRUD catégories
- `api/src/Controllers/AdminOccurrenceController.php` - CRUD occurrences
- `api/src/Controllers/AdminImageController.php` - Upload images

**Services** (logique métier):
- `api/src/Services/WalkService.php` - Logique promenades (eager loading)
- `api/src/Services/PlaceService.php` - Logique réserves
- `api/src/Services/SubcategoryService.php` - Logique catégories
- `api/src/Services/OccurrenceService.php` - Logique occurrences
- `api/src/Services/ImageService.php` - Upload et validation

**Validators & Exceptions**:
- `api/src/Validators/Validator.php` - Validation centralisée
- `api/src/ExceptionHandler.php` - Gestion erreurs globale
- `api/src/Exceptions/ApiException.php` - Exception base
- `api/src/Exceptions/ValidationException.php` - Erreurs validation (422)
- `api/src/Exceptions/NotFoundException.php` - Ressources manquantes (404)
- `api/src/Exceptions/DatabaseException.php` - Erreurs DB (500)

**Migrations**:
- `api/src/Migrations/MigrationRunner.php` - Gestionnaire migrations
- `api/src/Migrations/MigrationInterface.php` - Interface migrations
- `api/src/Migrations/M20260531_001_AddWalkExtraColumns.php` - Migration active

### Frontend Public
- `index.html` - Page d'accueil
- `catalogue.html` - Liste des promenades avec filtres
- `promenade.html` - Détail d'une promenade
- `reserves.html` / `reserve-detail.html` - Réserves naturelles
- `contact.html` - Demandes sur-mesure

### Frontend Admin
- `admin/index.html` - Dashboard KPI
- `admin/walks.html` - Gestion promenades
- `admin/walk-edit.html` - Éditeur promenade
- `admin/occurrences.html` - Gestion dates/horaires
- `admin/places.html` - Gestion réserves
- `admin/taxonomie.html` - Catégories

### JavaScript
**Public**:
- `assets/js/public-utils.js` - Utilitaires partagés (formatage, builders)
- `assets/js/catalogue.js` - Filtrage + cartes promenades
- `assets/js/promenade.js` - Page détail + promenades associées
- `assets/js/reserves.js` - Carrousel réserves
- `assets/js/reserve-detail.js` - Page détail réserve

**Admin**:
- `assets/js/admin-v2-common.js` - Utilitaires admin (API fetch, badges)
- `assets/js/admin-dashboard.js` - Dashboard
- `assets/js/admin-walks.js` - Liste + filtres promenades
- `assets/js/admin-walk-edit.js` - Formulaire + upload images
- `assets/js/admin-occurrences.js` - CRUD occurrences
- `assets/js/admin-places.js` - CRUD réserves
- `assets/js/admin-taxonomie.js` - CRUD sous-catégories

### CSS
- `assets/css/style.css` - Styles globaux
- `assets/css/catalogue.css` - Catalogue + détail
- `assets/css/reserves.css` - Pages réserves
- `assets/css/admin-v2.css` - Interface admin moderne

### Base de données
- `database/schema.sql` - Schéma MySQL
- `database/schema.sqlite.sql` - Schéma SQLite
- `database/seed.sql` - Données initiales
- `database/seed.sqlite.sql` - Seed SQLite

### Documentation
- `docs/setup.md` - Instructions déploiement
- `docs/architecture.md` - Vue d'ensemble projet
- `docs/api-contract.md` - Documentation API
- `docs/refactoring-architecture-2026.md` - Documentation refactoring (Mai 2026)
- `docs/check-complet-20260531.md` - Rapport de santé système (31/05/2026)

### Scripts
- `scripts/init-local.php` - Initialisation SQLite
- `scripts/run-local.ps1` - Lanceur PowerShell
- `scripts/run-local.cmd` - Lanceur CMD

---

## 🗄️ Structure Base de Données

### Tables principales

**families** (familles de produits)
- `id`, `code` (decouverte/thematique/sur-mesure)
- `label_fr`, `is_product`, `sort_order`

**subcategories** (catégories thématiques)
- `id`, `slug`, `name_fr`, `created_at`

**places** (réserves naturelles)
- `id`, `slug`, `name_fr`, `headline_fr`
- `short_description_fr`, `long_description_fr`
- `cover_image_url`
- `metric_map_label`, `metric_map_value`
- `area_ha`, `created_year`, `species_count`
- `specificities_json` (JSON: [{image, text}])
- `created_at`, `updated_at`

**walks** (promenades)
- `id`, `slug`, `title`, `summary`, `description`
- `family_id` (FK), `subcategory_id` (FK), `place_id` (FK)
- `dates_subtitle`, `duration_minutes`, `level_label`
- `distance_km`, `target_public`, `min_age`
- `practical_info_json` (JSON: array of strings)
- `pmr_accessible` (PMR = Personnes à Mobilité Réduite)
- `price_label`
- `cover_image_url`, `content_image_url`
- `gallery_json` (JSON: array of URLs)
- `booking_mode` (link/iframe/hybrid)
- `booking_url`, `booking_embed_url`
- `status` (draft/published/archived)
- `created_at`, `updated_at`

**walk_occurrences** (dates/horaires)
- `id`, `walk_id` (FK, CASCADE DELETE)
- `starts_at`, `ends_at`
- `max_capacity`, `available_capacity`
- `booking_url`, `booking_embed_url` (peuvent override walk)
- `status` (draft/published/cancelled)
- `created_at`, `updated_at`

---

## 🔌 API Endpoints

**Base**: `/api`

### Public (GET)
- `GET /` - Info API
- `GET /health` - Health check
- `GET /public/families` - Liste familles
- `GET /public/subcategories` - Liste catégories
- `GET /public/places` - Liste réserves
- `GET /public/walks` - Liste promenades (filtres: family, subcategory, place, from_date)
- `GET /public/walks/{slug}` - Détail promenade avec occurrences

### Admin (POST/DELETE - PAS D'AUTH dans MVP)
- `GET /admin/meta` - Métadonnées (familles, catégories, réserves)
- `GET /admin/families` - Familles avec compteurs
- `GET /admin/subcategories` - Catégories avec compteur walks
- `GET /admin/places` - Toutes les réserves
- `GET /admin/walks` - Toutes les promenades (hydratées)
- `POST /admin/upload-image` - Upload image (max 8MB) → retourne URL
- `POST /admin/subcategories` - Créer catégorie
- `POST /admin/subcategories/{id}` - MAJ catégorie
- `DELETE /admin/subcategories/{id}` - Supprimer catégorie
- `POST /admin/places` - Créer réserve
- `POST /admin/places/{id}` - MAJ réserve
- `POST /admin/walks` - Créer promenade
- `POST /admin/walks/{id}` - MAJ promenade
- `POST /admin/walk-occurrences` - Créer occurrence
- `POST /admin/walk-occurrences/{id}` - MAJ occurrence
- `DELETE /admin/walk-occurrences/{id}` - Supprimer occurrence

---

## ✨ Fonctionnalités

### Public
✅ Page d'accueil (hero video + cartes familles + carrousel réserves)  
✅ Catalogue promenades avec filtres (famille, catégorie, lieu, date)  
✅ Détail promenade (description, galerie, infos pratiques, dates, capacités)  
✅ Liste et détail réserves naturelles  
✅ Promenades associées dans même réserve  
✅ Intégration réservation Billetweb (3 modes: link/iframe/hybrid)  
✅ Responsive design  

### Admin
✅ Dashboard KPI (total walks, ratio publié/brouillon, prochaines occurrences)  
✅ CRUD promenades complet  
✅ Gestion occurrences (dates/horaires/capacités)  
✅ Upload images (validation, max 8MB)  
✅ CRUD réserves naturelles  
✅ CRUD catégories/sous-catégories  
✅ Filtres (recherche texte, famille, statut)  
✅ Gestion galeries photos  
✅ Modes de réservation configurables  

---

## 🚀 Démarrage Local

### Prérequis
- PHP 8.0+ avec extensions `pdo_sqlite` et `sqlite3`

### Commandes
```bash
# PowerShell
scripts/run-local.ps1

# CMD
scripts/run-local.cmd

# Manuel
php scripts/init-local.php
php -S 127.0.0.1:8080 router.php
```

### Accès
- Public: http://127.0.0.1:8080/
- Admin: http://127.0.0.1:8080/admin/

---

## ⚙️ Configuration

### Variables d'environnement
```bash
DB_DRIVER=sqlite          # "mysql" ou "sqlite"
DB_HOST=127.0.0.1        # MySQL uniquement
DB_PORT=3306             # MySQL uniquement
DB_NAME=natagora_catalogue
DB_USER=db_user
DB_PASS=db_password
DB_SQLITE_PATH=/path/to/local.sqlite
```

### Déploiement Production (OVH)
1. Créer base MySQL
2. Importer `database/schema.sql`
3. Importer `database/seed.sql`
4. Configurer env ou copier `api/config.example.php` → `api/config.php`
5. Vérifier `api/.htaccess` (route vers `/api/index.php`)
6. **IMPORTANT**: Ajouter authentification admin avant mise en ligne

---

## 🎨 Intégration Réservation

### Modes booking
- **link**: Bouton redirigeant vers Billetweb
- **iframe**: Iframe Billetweb embarqué dans page détail
- **hybrid** (recommandé): Iframe + fallback lien si bloqué CORS/CSP

### Configuration par promenade
- `booking_mode`: choix du mode
- `booking_url`: URL externe Billetweb
- `booking_embed_url`: URL iframe embed
- Peut être overridé au niveau occurrence

---

## 📊 État d'avancement

### ✅ Complété
- **Architecture refactorisée (Mai 2026)**: Controllers, Services, Validators
- **Router orienté objet** avec support regex
- Core API (tous endpoints public + admin)
- Schéma DB (MySQL + SQLite)
- Catalogue avec filtrage
- Pages détail (promenades + réserves)
- Admin complet (dashboard, CRUD)
- Upload images
- Design responsive
- Localisation française
- Modes réservation flexibles
- Setup dev local SQLite

### ⚠️ TODO / Hors scope MVP
- Authentification admin (intentionnellement omis MVP)
- Comptes utilisateurs / wishlists
- Avis et notations
- Opérations bulk admin
- Notifications email
- Multilingue (i18n)
- Gestionnaire média avancé
- Synchronisation capacités avec Billetweb
- Analytics/reporting

---

## 🔒 Sécurité

### État actuel
- Admin **SANS authentification** (MVP)
- CORS activé tous origins
- Prepared statements (protection SQL injection)
- Validation upload images (types, taille max 8MB)

### Avant production
⚠️ **OBLIGATOIRE**: Ajouter middleware authentification admin  
⚠️ Restreindre CORS origins  
⚠️ Rate limiting API  
⚠️ HTTPS obligatoire  

---

## 📦 Données de test

### Seed inclut
- 3 familles (Découverte, Thématique, Sur-mesure)
- 2 sous-catégories (Botanique, Ornithologie)
- 1 réserve exemple (Montagne Saint-Pierre)
- 1 promenade exemple (Balade botanique de printemps)
- 2 occurrences (15 et 22 juin 2026)

---

## 🔧 C (Refactoring Mai 2026)
- **Architecture**: Controllers → Services → Database
- **Router orienté objet** avec support regex (#pattern#)
- **PSR-4 Autoloading** (Natagora\API namespace)
- **Dependency Injection** dans constructeurs
- **Service Layer Pattern** pour logique métier
- Type declarations (PHP 8.0+)
- PDO prepared statements
- Error handling avec try-catch
- JSON responses (via Response class)ch
- JSON responses (via Response class)
- Namespacing: `Natagora\API`

### JavaScript
- ES6+ (const/let, arrow functions, template literals)
- Async/await pour API calls
- Pas de framework (vanilla JS)
- Fetch API
- LocalStorage pour préférences filtres

### CSS
- BEM-like naming
- Variables CSS (custom properties)
- Mobile-first responsive
- Flexbox/Grid layouts

### Base de données
- Snake_case pour noms tables/colonnes
- IDs auto-increment
- Timestamps created_at/updated_at
- JSON columns pour structures flexibles
- Foreign keys avec ON DELETE CASCADE/SET NULL
- Indexes sur colonnes fréquemment filtrées

---

## 📝 Notes importantes

1. **Admin non sécurisé**: Ajouter auth avant prod
2. **Images**: Stockées dans `assets/media/uploads/`, max 8MB
9. **Architecture refactorisée (Mai 2026)**: 91% réduction code index.php (1500→130 lignes)
10. **Backup**: Ancien code conservé dans `api/index.old.php`
3. **Réservations**: Gérées par Billetweb (externe)
4. **Capacités**: Pas de sync auto avec Billetweb (manuel dans MVP)
5. **Localization**: Tout en français, colonnes `_fr` pour i18n future
6. **SQLite**: Dev local uniquement, MySQL pour prod
7. **PMR**: Personnes à Mobilité Réduite (accessibilité fauteuil)
8. **URL slugs**: Générés automatiquement, utilisés pour routing SEO-friendly

---

## 🎯 Objectifs projet

**Objectif principal**: Remplacer landing page statique par catalogue dynamique réservable

**Scope MVP**:
- Interface publique consultation + liens réservation
- Interface admin gestion contenu
- Pas de fonctionnalités communautaires (comptes, avis)
- Pas de paiement intégré (délégué Billetweb)

**Succès défini par**:
- Capacité publier/modifier promenades facilement
- Visiteurs trouvent et réservent  - Architecture refactoriséeexpériences
- Performance acceptable shared hosting OVH
- Base solide pour évolutions futures

---

*Dernière mise à jour: 31 mai 2026 - Architecture refactorisée + Check complet validé ✅*  
*Voir [check-complet-20260531.md](check-complet-20260531.md) pour rapport détaillé*
