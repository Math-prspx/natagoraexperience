# Checklist autonomie et controle de la version Live

Objectif: reprendre la main rapidement sur la prod des que l acces GitLab est actif, sans dependance inutile a l hebergeur.

## 0) Precondition d autonomie

- Avoir un acces GitLab avec droits push/merge sur la branche de deploiement.
- Avoir acces aux pipelines CI/CD et a leurs logs.
- Idealement: acces aux variables d environnement du projet (role Maintainer ou equivalent).

## 1) Priorite immediate (les 3 points)

### 1.1 Audit config auth prod

- Identifier la branche qui deploie la prod.
- Verifier la source de config effective: variables env, fichier config, ou mix.
- Verifier les valeurs auth critiques:
  - ADMIN_USERNAME
  - ADMIN_PASSWORD_HASH (doit etre un vrai hash bcrypt)
  - ADMIN_AUTH_SECRET
  - ADMIN_TOKEN_TTL
- Verifier DEBUG_MODE = 0 en prod.
- Verifier CORS actif (domaine cible).
- Verifier ou les logs auth/API sont ecrits.

### 1.2 Patch securise pour retablir l acces admin

- Definir un compte admin de recuperation temporaire.
- Generer un hash bcrypt propre pour ce compte.
- Rotater les secrets potentiellement exposes:
  - ADMIN_AUTH_SECRET
  - mot de passe admin
  - DB_PASS si necessaire
- Deployer via pipeline (eviter les modifications manuelles serveur).
- Desactiver le compte temporaire apres reprise de controle.

### 1.3 Verification immediate post-patch

- Tester login admin.
- Tester endpoint admin protege avec token valide.
- Verifier qu un acces sans token renvoie 401.
- Verifier les logs: login OK/KO et absence d erreurs critiques.
- Faire un mini test CRUD admin (lecture + modification simple).

## 2) Verification complete de la config live

### 2.1 Pipeline CI/CD

- Confirmer le trigger prod exact (branche/tag/job manuel).
- Confirmer les dossiers deployes:
  - front
  - api
  - assets
  - uploads (si inclus)
- Ajouter ou verifier une etape smoke test post-deploy.
- Verifier rollback simple vers le commit precedent.

### 2.2 Variables d environnement

- DB_DRIVER, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_CHARSET.
- APP_BASE_URL, APP_DEFAULT_LOCALE, APP_PUBLIC_URL (si utilise pour liens de reset).
- ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_AUTH_SECRET, ADMIN_TOKEN_TTL.
- DEBUG_MODE.
- Variables mail (si reset par email):
  - MAIL_HOST
  - MAIL_PORT
  - MAIL_USERNAME
  - MAIL_PASSWORD
  - MAIL_FROM
  - MAIL_FROM_NAME

### 2.3 Infra et permissions

- Ecriture OK sur:
  - api/cache
  - api/logs
  - assets/media/uploads
- Horloge serveur correcte (expiration token/reset).
- Sortie SMTP autorisee (si reset email).

## 3) Conditions de controle durable

- Deux comptes super admin minimum.
- Procedure de recuperation d acces documentee.
- Rotation periodique des secrets.
- Logs pipeline et applicatifs consultables.
- Procedure de release et de rollback courte et testee.

## 4) Runbook express (jour J)

1. Valider les droits GitLab et la branche prod.
2. Auditer la config auth effective.
3. Corriger/rotater les secrets si necessaire.
4. Deployer via pipeline.
5. Tester login + endpoints admin + CRUD minimal.
6. Verifier logs et confirmer stabilite.
7. Archiver le resultat (capture pipeline + checklist cochee).

## 5) Limites de verification (a connaitre)

Ce qui est verifiable directement:
- Code repo
- Pipeline et logs CI/CD
- Endpoints live
- Correctifs applicatifs

Ce qui depend de droits infra supplementaires:
- Valeurs masquees non visibles
- Config AWS hors GitLab
- Acces direct DB prod
