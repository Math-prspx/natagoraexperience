# Setup local et OVH mutualise

## Mode local rapide (SQLite)
1. Ouvrir un terminal a la racine du projet.
2. Lancer `scripts\\run-local.ps1` (PowerShell) ou `scripts\\run-local.cmd` (CMD).
3. Ouvrir http://127.0.0.1:8080

Ce mode:
- initialise `database/local.sqlite`
- active `DB_DRIVER=sqlite`
- lance le serveur PHP local avec `router.php`

Pages utiles en local:
- `/index.html`
- `/catalogue.html`
- `/promenade.html?slug=balade-botanique-printemps`
- `/admin/index.html`

Depannage local:
- Si `could not find driver` apparait, activer SQLite dans PHP.
- Dans `php.ini`, decommenter (ou ajouter):
  - `extension=pdo_sqlite`
  - `extension=sqlite3`
- Verifier avec `php -m` que `pdo_sqlite` et `sqlite3` apparaissent.

## 1) Base de donnees
1. Creer une base MySQL.
2. Importer `database/schema.sql`.
3. Importer `database/seed.sql`.

## 2) Configuration API
1. Copier `api/config.example.php` vers `api/config.php` si besoin.
2. Renseigner les variables DB dans `api/config.php` ou via variables d environnement:
  - `DB_DRIVER` (`mysql` ou `sqlite`)
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASS`
  - `DB_SQLITE_PATH`

## 3) Apache / OVH
- Le fichier `api/.htaccess` redirige les routes vers `api/index.php`.
- Les pages publiques sont:
  - `index.html`
  - `catalogue.html`
  - `promenade.html?slug=...`
  - `contact.html`
  - `admin/index.html`

## 4) Reservation Billetweb
- Preferer `booking_mode = hybrid`.
- Si iframe bloquee par le fournisseur, le lien externe reste disponible.

## 5) Securite
- L admin est volontairement sans auth pour ce MVP.
- Ajouter une protection d acces avant mise en production.
