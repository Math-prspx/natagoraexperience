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
2. Copier `.env.example` vers `.env` a la racine du projet (fichier ignore par git).
3. Renseigner les variables DB/Auth dans `.env` ou via variables d environnement du serveur:
  - `DB_DRIVER` (`mysql` ou `sqlite`)
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASS`
  - `DB_CHARSET`
  - `DB_SQLITE_PATH`
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD_HASH`
  - `ADMIN_AUTH_SECRET`
  - `ADMIN_TOKEN_TTL`
  - `DEBUG_MODE`

Chargement config (priorite):
1. variables d environnement du processus
2. valeurs du fichier `.env` (si present)
3. fallback `api/config.php`

## 3) Apache / OVH
- Le fichier `api/.htaccess` redirige les routes vers `api/index.php`.
- Les pages publiques sont:
  - `index.html`
  - `catalogue.html`
  - `promenade.html?slug=...`
  - `contact.html`
  - `admin/index.html`

  ## 3bis) Checklist deploiement frontend (HTML/CSS/JS/images)

  Quand des changements concernent uniquement le front, verifier avant upload:

  1. Synchroniser les pages source et leurs equivalents dans `deploy/` si ce dossier est utilise pour la livraison.
  2. Synchroniser les assets modifies:
    - `assets/css/*`
    - `assets/js/*`
    - `img/*` puis `deploy/img/*`
  3. Verifier la casse exacte des fichiers image (`.jpg` vs `.JPG`) car OVH/Linux est case-sensitive.
  4. Ouvrir les pages publiques critiques apres upload:
    - `index.html`
    - `catalogue.html`
    - `sur-mesure.html`
    - `a-propos.html`
    - `reserves.html`
    - `reserve-detail.html`

## 4) Reservation Billetweb
- Preferer `booking_mode = hybrid`.
- Si iframe bloquee par le fournisseur, le lien externe reste disponible.

## 5) Securite
- L admin est protege par authentification Bearer token HMAC-SHA256.
- Les credentials et le secret doivent etre fournis par variables d environnement / `.env`.
- Avant production, changer les credentials par defaut et desactiver le debug si encore actif.

## 5bis) GitLab CI / Deploiement AWS

- Recommande: stocker les secrets uniquement dans les variables masquees/protegees GitLab CI.
- Ne jamais committer de fichier `.env` avec des valeurs reelles.
- Le depot contient `.env.example` pour documenter les cles attendues.
- Le pipeline de deploiement peut injecter les variables d environnement sur les instances AWS (ou ecrire un `.env` cible lors du deploy).

## 6) Pieges MySQL OVH (mutualise)

### DDL implicit commit
MySQL annule automatiquement toute transaction ouverte des qu une commande DDL
(`ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`...) est executee.
Le `PDO->commit()` suivant crash avec "There is no active transaction".

**Fix dans MigrationRunner :** toujours verifier `inTransaction()` avant `commit()` ET `rollBack()`.

```php
if ($this->pdo->inTransaction()) {
    $this->pdo->commit();
}
```

### ADD COLUMN IF NOT EXISTS non supporte
La version MySQL d OVH mutualisee ne supporte pas `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
Utiliser `SHOW COLUMNS FROM table LIKE 'column'` pour verifier l existence avant d ajouter.

### config.php gitignore
`api/config.php` est gitignore et ne part pas dans le deploy git.
Il faut l uploader manuellement via FTP a chaque modification.
Le fichier de reference local est `deploy/api/config.php`.
