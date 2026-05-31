$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$php = Get-Command php -ErrorAction SilentlyContinue
if (-not $php) {
  Write-Error "PHP n'est pas disponible dans le PATH. Installe PHP puis reessaie."
}

$env:DB_DRIVER = "sqlite"
$env:DB_SQLITE_PATH = Join-Path $root "database\local.sqlite"

php scripts/init-local.php

Write-Host "Serveur local: http://127.0.0.1:8080"
php -S 127.0.0.1:8080 router.php
