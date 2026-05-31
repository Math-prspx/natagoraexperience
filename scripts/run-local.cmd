@echo off
setlocal
set ROOT=%~dp0..
cd /d %ROOT%

where php >nul 2>nul
if errorlevel 1 (
  echo PHP n'est pas disponible dans le PATH. Installe PHP puis reessaie.
  exit /b 1
)

set DB_DRIVER=sqlite
set DB_SQLITE_PATH=%ROOT%\database\local.sqlite

php scripts\init-local.php
if errorlevel 1 exit /b 1

echo Serveur local: http://127.0.0.1:8080
php -S 127.0.0.1:8080 router.php
