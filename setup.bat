@echo off
echo ================================
echo Vibe Message - NX Workspace Setup
echo ================================
echo.

echo [1/4] Checking if .env exists...
if not exist "apps\server\.env" (
    echo ERROR: apps\server\.env not found!
    echo Please run: node apps\server\src\scripts\setupEnv.js
    echo Then add VAPID keys to apps\server\.env
    exit /b 1
)
echo ✓ apps\server\.env found

echo.
echo [2/4] Creating frontend .env...
echo VITE_API_URL=http://localhost:3000 > apps\frontend\.env
echo ✓ apps\frontend\.env created

echo.
echo [3/4] Installing Workspace Dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install workspace dependencies
    exit /b 1
)
echo ✓ Workspace dependencies installed

echo.
echo [4/4] Setting up database...
call npm run build:server:prod
call npx nx run vibe-message-server:db:setup
if errorlevel 1 (
    echo ERROR: Failed to setup database
    echo Make sure PostgreSQL is running and database exists
    exit /b 1
)
echo ✓ Database schema created

echo.
echo ================================
echo ✓ Setup Complete!
echo ================================
echo.
echo Next steps:
echo Run all apps simultaneously: npm run serve-all:dev
echo Visit: http://localhost:5173
echo.
echo Super Admin Login:
echo   Email: admin@fcmclone.com
echo   Password: SuperAdmin@123
echo.
