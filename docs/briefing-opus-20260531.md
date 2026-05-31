# Briefing Projet Natagora Xperience - 31 mai 2026

## 📋 Vue d'ensemble

**Natagora Xperience** est une plateforme web de réservation d'expériences nature guidées dans les réserves naturelles de Natagora (Wallonie & Bruxelles).

### Objectif
Permettre au public de découvrir et réserver des sorties guidées en réserve naturelle à travers 3 types d'expériences :
- **Découverte** : Initiation accessible à tous
- **Thématique** : Approfondissement sur thèmes spécifiques
- **Naturalistes** : Expertise pour connaisseurs
- **Sur mesure** : Expériences personnalisées pour groupes

---

## 🏗️ Architecture Technique

### Stack
- **Backend** : PHP 8.4.21 avec architecture PSR-4
- **Base de données** : SQLite (dev) / MySQL (prod prévu)
- **Frontend** : Vanilla JavaScript ES6+, CSS3 (pas de framework)
- **Serveur dev** : PHP built-in server (127.0.0.1:8080) via router.php
- **Hébergement cible** : OVH shared hosting

### Structure Backend (API)
```
api/
├── config.php                    # Configuration DB & environnement
├── index.php                     # Point d'entrée API (routage)
├── src/
│   ├── Router.php               # Système de routage REST
│   ├── Database.php             # Connexion PDO SQLite/MySQL
│   ├── Response.php             # Gestion des réponses JSON
│   ├── ExceptionHandler.php     # Gestion centralisée des erreurs
│   ├── Controllers/             # Logique métier par domaine
│   │   ├── PublicController.php
│   │   ├── AdminWalkController.php
│   │   ├── AdminOccurrenceController.php
│   │   ├── AdminPlaceController.php
│   │   └── AdminImageController.php
│   ├── Services/                # Logique métier réutilisable
│   │   ├── WalkService.php
│   │   ├── OccurrenceService.php
│   │   ├── PlaceService.php
│   │   └── ImageService.php
│   ├── Validators/              # Validation des données
│   │   └── Validator.php
│   └── Exceptions/              # Exceptions custom
│       ├── ApiException.php
│       ├── NotFoundException.php
│       └── ValidationException.php
```

### Structure Frontend
```
assets/
├── css/
│   ├── style.css              # ⭐ CLASSES COMMUNES (hero, sections, boutons)
│   ├── sur-mesure.css         # Spécifique : .sm-split, .sm-steps
│   ├── a-propos.css           # Spécifique : .about-missions-grid
│   ├── en-pratique.css        # Minimal (utilise style.css)
│   ├── catalogue.css          # Page catalogue expériences
│   ├── reserves.css           # Page réserves
│   └── reserve-detail.css     # Page détail réserve
├── js/
│   ├── main.js                # Navigation overlay
│   ├── catalogue.js           # Filtres & affichage expériences
│   ├── reserves.js            # Carrousel réserves
│   ├── admin-*.js             # Admin dashboards
│   └── public-utils.js        # Utilitaires réutilisables
└── media/uploads/             # Images uploadées

index.html                      # Homepage avec hero vidéo
catalogue.html                  # Liste expériences + filtres
reserves.html                   # Présentation des réserves
reserve-detail.html             # Détail d'une réserve
promenade.html                  # Page découverte promenade
sur-mesure.html                 # ⭐ Expériences personnalisées
a-propos.html                   # ⭐ À propos Natagora
en-pratique.html                # ⭐ Infos pratiques
contact.html                    # Formulaire contact
```

---

## 🎨 Système de Design (Post-homogénéisation)

### Variables CSS (`:root` dans style.css)
```css
--font-body: "Barlow", sans-serif;
--font-display: "Rubik Dirt", system-ui;
--color-ink: #121212;           /* Texte principal */
--color-cta: #a2b21c;           /* Vert CTA */
--color-cta-hover: #b02528;     /* Rouge hover */
--color-muted: #737373;         /* Texte secondaire */
--nav-height: 10vh;
--section-pad-x: 80px;
--section-pad-y-md: 120px;
--radius-sm: 6px;
```

### Classes Communes (style.css) ⭐ NOUVEAU
**Créées lors de l'homogénéisation du 31/05/2026**

#### Structure de page
- `.content-page` : Body des pages de contenu
- `.content-main` : Main container

#### Hero (92vh avec image background)
- `.content-hero` : Section hero pleine hauteur
- `.content-hero-layer` : Couche décorative (Map-bgr-01.png)
- `.content-hero-content` : Container contenu hero
- `.content-kicker` : Petit texte surtitre
- `.content-hero-title` : H1 monumentale (Rubik Dirt)
- `.content-hero-intro` : Texte introductif
- `.content-hero-actions` : Container boutons

#### Sections
- `.content-section` : Section standard (100px 80px padding)
- `.content-section-alt` : Fond gris (#f9f9f9)
- `.content-section-cta` : Fond vert CTA
- `.content-section-center` : Texte centré
- `.content-section-inner` : Max-width 900px centré
- `.content-section-title` : H2 titre section
- `.content-section-text` : Paragraphe standard

#### Boutons
- `.btn-primary` : Bouton vert CTA principal
- `.btn-secondary` : Bouton outline
- `.btn-white` : Variante blanche (pour fond coloré)

#### Listes
- `.content-list-checked` : Liste avec checkmarks ✓ verts

#### Responsive
- **1100px** : Tablette (padding réduit)
- **768px** : Mobile (hero 72vh, padding 60px/20px)

### Pages utilisant les classes communes
✅ **sur-mesure.html** : Hero + sections communes + `.sm-split` + `.sm-steps`
✅ **a-propos.html** : Hero + sections communes + `.about-missions-grid` + social icons
✅ **en-pratique.html** : 100% classes communes (pas de CSS spécifique)

---

## 📂 Fichiers Clés

### Configuration
- `api/config.php` : DB credentials, environment, CORS
- `router.php` : Routing pour PHP dev server

### Base de données
- `database/schema.sql` : Structure MySQL
- `database/schema.sqlite.sql` : Structure SQLite
- `database/seed.sql` : Données de test
- `database/local.sqlite` : DB locale active

### Navigation
- Navigation overlay unifiée dans tous les HTML
- JavaScript dans `assets/js/main.js`
- 8 liens principaux :
  - Découverte → `catalogue.html?family=decouverte`
  - Thématique → `catalogue.html?family=thematique`
  - Naturalistes → `catalogue.html`
  - Sur mesure → `sur-mesure.html`
  - Les réserves → `reserves.html`
  - À propos → `a-propos.html`
  - En pratique → `en-pratique.html` ⭐
  - Contact → `contact.html`

---

## 🎯 Travail Récent (31/05/2026)

### Homogénéisation des CSS ⭐ MAJEUR

**Problème identifié** : 3 nouvelles pages (sur-mesure, a-propos, en-pratique) avaient des styles redondants dupliqués dans chaque fichier CSS.

**Solution implémentée** :
1. ✅ Création d'un système de classes communes dans `style.css`
2. ✅ Nettoyage de `sur-mesure.css` (-75% de code)
3. ✅ Nettoyage de `a-propos.css` (-85% de code)
4. ✅ Nettoyage de `en-pratique.css` (-95% de code → minimal)
5. ✅ Mise à jour des 3 HTML avec nouvelles classes
6. ✅ Validation : 0 erreur

**Bénéfices** :
- Code maintenable : modifications centralisées
- Cohérence totale : mêmes styles partout
- Performance : moins de CSS redondant
- Évolutivité : nouvelles pages rapides à créer
- Prêt pour animations futures

### Pages créées récemment
- `sur-mesure.html` + CSS : Expériences personnalisées (hero, intro, 2 sections split 50/50, 3 steps)
- `a-propos.html` + CSS : Histoire Natagora, 4 missions (grid), support, newsletter avec social icons
- `en-pratique.html` + CSS : Tarifs, engagements, avant venue, CTA réservation

---

## 🔧 Conventions de Code

### Backend PHP
- PSR-4 autoloading via `composer.json`
- Try-catch dans controllers → `ApiException`
- Validation via `Validator::class`
- Services pour logique métier réutilisable
- Responses JSON via `Response::class`

### Frontend JavaScript
- ES6+ modules
- Fetch API pour requêtes AJAX
- `public-utils.js` : fonctions réutilisables (`fetchJSON`, `formatDate`)
- Pas de jQuery, pas de framework

### CSS
- BEM-like naming : `.block-element`, `.block--modifier`
- Variables CSS pour couleurs/spacing
- Mobile-first responsive (min-width)
- Animations via `transition` (pas de @keyframes sauf nécessaire)

### HTML
- Semantic HTML5
- `aria-label`, `aria-hidden` pour accessibilité
- `alt` sur toutes les images
- Structure : nav → main → sections → footer

---

## 🚀 État du Projet

### ✅ Fonctionnel
- [x] Backend API REST complet
- [x] CRUD admin (walks, occurrences, places, images)
- [x] Frontend catalogue avec filtres
- [x] Pages réserves avec carrousel
- [x] Navigation overlay unifiée
- [x] 3 nouvelles pages (sur-mesure, a-propos, en-pratique)
- [x] Homogénéisation CSS (31/05/2026)

### 🔄 En cours / À faire
Référence : `docs/check-complet-20260531.md` (tâches 1-11)

**Priorités potentielles** :
- Tâche 11 : Build pipeline / minification (reportée)
- Optimisations SEO (meta descriptions, structured data)
- Tests cross-browser
- Optimisation images (lazy loading, WebP)

---

## 💾 Commandes Utiles

### Démarrer le serveur
```bash
php -S 127.0.0.1:8080 router.php
```

### Accès
- **Frontend** : http://127.0.0.1:8080/
- **API** : http://127.0.0.1:8080/api/
- **Admin** : http://127.0.0.1:8080/admin/

### Base de données
- **SQLite locale** : `database/local.sqlite`
- **Migrations** : Voir `api/src/Migrations/`

---

## 📝 Notes Importantes

### Images
- Hero background : `img/chouette.jpg` (utilisé dans hero commun)
- Décorative layer : `img/Map-bgr-01.png` (utilisé dans hero)
- Logos : `img/logo.png`
- Uploads : `assets/media/uploads/`

### Performance
- Pas de build tools actuellement (Vite/Webpack)
- CSS/JS servis non-minifiés
- Fonts : Google Fonts (Barlow, Rubik Dirt)

### Compatibilité
- PHP ≥ 8.1 requis (union types, enums)
- Navigateurs modernes (ES6+, CSS Grid)

---

## 🎯 Points d'Attention pour Opus

1. **Classes CSS communes** : Utiliser `.content-*` pour toute nouvelle page de contenu
2. **Cohérence navigation** : Overlay menu doit être présent partout
3. **Hero pattern** : 92vh, image background, gradient overlay, decorative layer
4. **Responsive** : Breakpoints 1100px et 768px
5. **API REST** : Routes définies dans `api/index.php`
6. **Validation** : Toujours utiliser `Validator::class` avant DB

---

## 📞 Contact Développeur

Contexte session précédente avec Sonnet 4.5 disponible dans :
- `docs/project-checkpoint.md`
- `docs/check-complet-20260531.md`
- Transcripts complets dans workspaceStorage

**Serveur actif** : http://127.0.0.1:8080
**Date dernière modification** : 31 mai 2026

---

*Document généré pour transition vers Claude Opus - Projet Natagora Xperience*
