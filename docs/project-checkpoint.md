# Natagora Xperience - Checkpoint de Référence

**Date**: Juin 2026  
**Version**: v4.1  
**Client**: Natagora  
**Type**: Plateforme de catalogue et réservation d'expériences nature

---

## 🎯 Vue d'ensemble

Plateforme MVP pour transformer la page statique Natagora en catalogue dynamique de promenades guidées dans des réserves naturelles. Système de gestion complet avec interface publique et administration.

**3 familles de produits**:
- **Découverte**: Promenades d'initiation
- **Thématique**: Sorties spécialisées (botanique, ornithologie, etc.)
- **Sur-mesure**: Expériences personnalisées (contact direct)

### Mise a jour front - 02/06/2026

- Refonte hero sur pages contenu avec variantes dediees:
    - `content-hero-surmesure`
    - `content-hero-apropos`
    - `content-hero-pratique`
- Section "Histoire Natagora" migree vers un bloc 50/50 type `sm-split` (texte + image) sur `a-propos.html`.
- Page `a-propos.html`: ajout d icones sur les 4 cartes "Nos missions" et simplification du bloc newsletter.
- Page `sur-mesure.html`: remplacement des visuels split par `surmesure-1.jpg` et `surmesure-2.jpg`.
- Page `reserves.html`: hero/sections visuelles ajustees, cartes piliers avec images, CTA secondaire retire.
- Page `reserve-detail.html` + `reserve-detail.js`: metriques converties en icones images (`Icon_surface.svg`, `Icon_creation.svg`, `Icon_home.svg`).
- Page `catalogue.html` + `public-utils.js`: icones famille blanches corrigees (`Icon_mountain-white.svg`, `Icon_theme-white.svg`, `Icon_mesure-white.svg`) et normalisation des URLs d icones.
- Page `promenade.js`: remplacement de l icone date hero par une icone calendrier.
- `catalogue.css`: augmentation de l espacement horizontal/vertical de la grille cartes.
- `index.html` + `style.css`: retouches copy/layout hero et cartes ressources.

Verification rapide effectuee:
- Aucune erreur IDE remontee (`get_errors` vide).
- Correction appliquee sur la casse du fichier image `reserve_action-3.JPG` reference dans `reserves.html` (important pour serveurs Linux case-sensitive).

Points de vigilance avant mise en prod:
- Plusieurs assets images ont ete ajoutes dans `img/` et doivent etre presents aussi dans `deploy/img/` lors de la livraison.
- Le dossier `deploy/` n est pas integralement synchro avec les dernieres modifs front source a cette date.

### Mise a jour front + API - 04/06/2026

- Occurrences promenade: affichage de la plage horaire `debut - fin` a la place de la duree.
- Occurrences promenade: ajout de l affichage du nom du guide sous l horaire avec une icone utilisateur.
- Detail promenade: nom du lieu dans les occurrences conserve en casse normale (plus de `toUpperCase()`).
- Admin occurrences: ajout du champ libre `Nom du guide` en creation et edition.
- API occurrences: ajout du champ `guide_name` sur les endpoints admin et dans la reponse publique `GET /public/walks/{slug}`.
- Base de donnees: ajout de la colonne `guide_name` sur `walk_occurrences` + migration versionnee `20260604_001`.
- Cache API: invalidation des cles `walk*` lors des create/update/delete d occurrences pour eviter des details promenade obsoletes.
- Catalogue: dans le modal de filtres, le bloc "Ou a partir d une date precise" est masque (sans suppression de code), source + deploy.

### Preparation livraison hebergeur - 04/06/2026

- Preparation CI/CD: structure prete pour un deploiement GitLab CI vers AWS (code compatible variables d environnement).
- Ajout d un chargeur `.env` minimal sans dependance externe (`api/src/Env.php` + `deploy/api/src/Env.php`).
- Chargement de `.env` branche dans les entrypoints API (`api/index.php` + `deploy/api/index.php`) avec fallback existant conserve.
- Ajout de `.env.example` a la racine avec toutes les cles attendues (DB, app, auth, debug).
- `api/config.example.php` mis a jour pour lecture des variables d environnement.
- `docs/setup.md` enrichi pour la procedure OVH/GitLab CI et la priorite de resolution de config.

Point a finaliser avant transfert GitLab hebergeur:
- Neutraliser les valeurs sensibles de `deploy/api/config.php` (garder uniquement placeholders + variables d environnement).

### Ajustements front + config locale - 05/06/2026

- Home `index.html`: remplacement du titre hero par le visuel `img/v3-03.png` avec classe dediee `hero-logo`.
- Home `style.css`: hero elargi et intro en pleine largeur pour accompagner le nouveau visuel d en-tete.
- Footer public: ajout d un lien "Politique de confidentialite" injecte par `assets/js/public-utils.js` et son miroir `deploy/assets/js/public-utils.js`.
- API source + deploy: chargement et priorite etendus aux fichiers `.env.local` et `.env.deploy.local`.
- `.gitignore`: ajout de `.env.deploy.local` pour eviter toute fuite de configuration locale de livraison.
- `deploy/`: synchronisation de `index.html`, `assets/css/style.css`, `assets/js/public-utils.js` et ajout requis du nouvel asset `img/v3-03.png`.
- Outil local: ajout du script `scripts/export-mysql.php` pour exporter une base MySQL vers `database/exports/` sans versionner les dumps generes.

---

## 🏗️ Architecture Technique

### Stack
- **Backend**: PHP 8.1+ / REST API / PDO / PSR-4 autoload
- **Base de données**: MySQL (prod OVH) / SQLite (dev local)
- **Frontend**: HTML5 / CSS3 / Vanilla JavaScript ES6+
- **Hébergement**: OVH mutualisé — `https://www.nothuman.be/natagora/`
- **Auth**: HMAC-SHA256 tokens (Bearer), bcrypt passwords, TTL 8h

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

**Migrations** (auto-run au démarrage, versionnées):
- `api/src/Migrations/MigrationRunner.php` - Gestionnaire (inTransaction() guard pour MySQL DDL)
- `api/src/Migrations/MigrationInterface.php` - Interface
- `api/src/Migrations/M20260531_001_AddWalkExtraColumns.php` - Colonnes extra walks
- `api/src/Migrations/M20260531_002_AddPlaceIntroImage.php` - intro_image_url places
- `api/src/Migrations/M20260601_001_RenameWalkContentImageUrl.php` - Renommage colonne walk
- `api/src/Migrations/M20260601_002_AddPlaceAccordions.php` - 4 colonnes accordion places
- `api/src/Migrations/M20260601_003_RemovePlaceMetricLabelSpecies.php` - Supprime metric_map_label + species_count

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
- `docs/project-checkpoint.md` - État courant et plan de travail

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
- `cover_image_url`, `intro_image_url`
- `metric_map_value` (ex: région)
- `area_ha`, `created_year`
- `specificities_json` (JSON: [{image, text}])
- `accordion1_title`, `accordion1_text` (HTML, ex: Faune & Flore)
- `accordion2_title`, `accordion2_text` (HTML, ex: Comment accéder ?)
- `created_at`, `updated_at`

**walks** (promenades)
- `id`, `slug`, `title`, `summary`, `description`
- `family_id` (FK), `subcategory_id` (FK), `place_id` (FK)
- `dates_subtitle`, `duration_minutes`, `level_label`
- `distance_km`, `target_public`, `min_age`
- `practical_info_json` (JSON: array of strings)
- `pmr_accessible` (PMR = Personnes à Mobilité Réduite)
- `price_label`
- `cover_image_url`, `intro_image_url`
- `gallery_json` (JSON: array of URLs)
- `booking_mode` (link/iframe/hybrid)
- `booking_url`, `booking_embed_url`
- `status` (draft/published/archived)
- `created_at`, `updated_at`

**walk_occurrences** (dates/horaires)
- `id`, `walk_id` (FK, CASCADE DELETE)
- `starts_at`, `ends_at`
- `guide_name` (texte libre, nom du guide)
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

### Admin (auth requise sauf login)
- `POST /admin/login` - Connexion admin → retourne token Bearer
- `GET /admin/meta` - Métadonnées (familles, catégories, réserves)
- `GET /admin/families` - Familles avec compteurs
- `GET /admin/subcategories` - Catégories avec compteur walks
- `GET /admin/places` - Toutes les réserves
- `GET /admin/places/{id}` - Détail réserve
- `GET /admin/walks` - Toutes les promenades (hydratées)
- `GET /admin/walks/{id}` - Détail promenade
- `POST /admin/upload-image` - Upload image (max 8MB) → retourne `item.url` et `item.thumb_url`
- `POST /admin/subcategories` - Créer catégorie
- `POST /admin/subcategories/{id}` - MAJ catégorie
- `DELETE /admin/subcategories/{id}` - Supprimer catégorie
- `POST /admin/places` - Créer réserve
- `POST /admin/places/{id}` - MAJ réserve
- `POST /admin/walks` - Créer promenade
- `POST /admin/walks/{id}` - MAJ promenade
- `DELETE /admin/walks/{id}` - Supprimer promenade
- `GET /admin/walk-occurrences` - Lister occurrences (filtre optionnel: walk_id)
- `POST /admin/walk-occurrences` - Créer occurrence
- `POST /admin/walk-occurrences/{id}` - MAJ occurrence
- `DELETE /admin/walk-occurrences/{id}` - Supprimer occurrence

Routes non exposees actuellement par le routeur:

---

## ✨ Fonctionnalités

### Public
✅ Page d'accueil (hero video + cartes familles + carrousel réserves)  
✅ Catalogue promenades avec filtres (famille, catégorie, lieu, date)  
✅ Détail promenade (description, galerie, infos pratiques, dates, capacités)  
✅ Liste et détail réserves naturelles  
✅ Sections accordéon dynamiques par réserve (Faune & Flore, Accès...)  
✅ 3 métriques par réserve (superficie, année création, région)  
✅ Promenades associées dans même réserve  
✅ Intégration réservation Billetweb (3 modes: link/iframe/hybrid)  
✅ Responsive design  

### Admin
✅ Authentification sécurisée (HMAC-SHA256 tokens, bcrypt)  
✅ Dashboard KPI (total walks, ratio publié/brouillon, prochaines occurrences)  
✅ CRUD promenades complet  
✅ Gestion occurrences (dates/horaires/capacités)  
✅ Upload images (validation, max 8MB)  
✅ CRUD réserves naturelles  
✅ Sections accordéon éditables par réserve (2 blocs titre + HTML)  
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
1. Créer base MySQL et importer `database/schema.sql` + `database/seed.sql`
2. Copier le dossier `deploy/` vers OVH via FTP
3. **Uploader manuellement** `deploy/api/config.php` (gitignored — credentials DB + auth)
4. Vérifier `deploy/api/.htaccess` (Authorization header passthrough + rewrite vers `index.php`)
5. Les migrations s'exécutent automatiquement au premier appel API

**Prod actuelle**: `https://www.nothuman.be/natagora/`  
**Config prod**: MySQL `nothumannatagora.mysql.db`, db/user = `nothumannatagora`

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
- **Authentification admin** HMAC-SHA256 (Juin 2026)
- **Accordéons réserves** (Faune & Flore / Accès) éditables (Juin 2026)
- **Suppression métriques obsolètes** (metric_map_label, species_count)
- Router orienté objet avec support regex
- Core API (tous endpoints public + admin)
- Schéma DB (MySQL + SQLite)
- Migrations versionnées auto-run
- Catalogue avec filtrage
- Pages détail (promenades + réserves)
- Admin complet (dashboard, CRUD)
- Upload images
- Design responsive
- Localisation française
- Modes réservation flexibles
- Setup dev local SQLite
- Déploiement OVH opérationnel

### ⚠️ TODO / Hors scope actuel
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
- Admin **sécurisé**: HMAC-SHA256 Bearer tokens, bcrypt passwords, TTL 8h
- CORS activé tous origins (acceptable OVH mutualisé)
- Prepared statements (protection SQL injection)
- Validation upload images (types, taille max 8MB)

### Recommandations production
⚠️ Restreindre CORS origins si sensible  
⚠️ Rate limiting API (non implémenté)  
✅ HTTPS actif sur OVH  

---

## 📦 Données de test

### Seed inclut
- 3 familles (Découverte, Thématique, Sur-mesure)
- 2 sous-catégories (Botanique, Ornithologie)
- 1 réserve exemple (Montagne Saint-Pierre)
- 1 promenade exemple (Balade botanique de printemps)
- 2 occurrences (15 et 22 juin 2026)

---

## 🔧 Conventions techniques

### PHP (refactoring Mai 2026)
- **Architecture**: Controllers → Services → Database
- **Router orienté objet** avec support regex (#pattern#)
- **PSR-4 Autoloading** (Natagora\API namespace)
- **Dependency Injection** dans constructeurs
- **Service Layer Pattern** pour logique métier
- Type declarations (PHP 8.1+)
- PDO prepared statements
- Error handling avec try-catch + ExceptionHandler global
- JSON responses via `Response` class
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

1. **Auth admin**: HMAC-SHA256 tokens Bearer, credentials dans `deploy/api/config.php` (gitignored)
2. **config.php**: Gitignored — uploader manuellement via FTP sur OVH à chaque modif
3. **Images**: Stockées dans `assets/media/uploads/`, max 8MB
4. **Architecture refactorisée (Mai 2026)**: 91% réduction code index.php (1500→130 lignes)
5. **Backup**: Ancien code conservé dans `api/index.old.php`
6. **Réservations**: Gérées par Billetweb (externe)
7. **Capacités**: Pas de sync auto avec Billetweb (manuel)
8. **Localization**: Tout en français, colonnes `_fr` pour i18n future
9. **SQLite**: Dev local uniquement, MySQL pour prod
10. **PMR**: Personnes à Mobilité Réduite (accessibilité fauteuil)
11. **URL slugs**: Générés automatiquement, utilisés pour routing SEO-friendly
12. **Migrations MySQL**: DDL fait un implicit commit — toujours utiliser `inTransaction()` avant `commit()`/`rollBack()`

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

## 🧭 Plan de travail (prochaine session)

Statut de cadrage validé le 11/06/2026. Cette section décrit le plan demandé, sans exécution des points 1 et 2 pour l'instant.

### Point 0 — Documentation (fait)
- Mettre à jour la documentation avec le plan ci-dessous.

### Point 1 — À faire
- Implémenter la création de compte admin.
- Stocker les utilisateurs admin en base de données.
- Prévoir un flux de récupération/réinitialisation du mot de passe.

### Point 2 — À faire
- Préparer une release propre et rapide à publier dès l'accès GitLab disponible.
- Viser un déploiement autonome sans dépendre d'une intervention manuelle de l'hébergeur.

---

*Dernière mise à jour: 11 juin 2026 - Nettoyage documentation et plan de travail validé*
