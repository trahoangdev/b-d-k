@echo off
echo =====================================================
echo Big Data Keeper - PostgreSQL Database Setup (Windows)
echo =====================================================
echo.

REM Check if psql is available
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL client (psql) not found!
    echo Please install PostgreSQL or add psql to your PATH
    echo Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL client found
echo.

REM Get database connection details
set /p DB_HOST="Enter PostgreSQL host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Enter PostgreSQL port (default: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set /p DB_USER="Enter PostgreSQL superuser (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

echo.
echo 🔧 Creating database and user...
echo.

REM Create database and user
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -f quick-setup.sql

if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    echo Please check your PostgreSQL connection and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Database setup completed successfully!
echo.
echo 📋 Connection Details:
echo    Host: %DB_HOST%
echo    Port: %DB_PORT%
echo    Database: big_data_keeper
echo    User: big_data_keeper_user
echo    Password: big_data_keeper_password_2024
echo.
echo 🔗 Connection String:
echo    postgresql://big_data_keeper_user:big_data_keeper_password_2024@%DB_HOST%:%DB_PORT%/big_data_keeper
echo.
echo 📝 Next Steps:
echo    1. Update your .env file with the connection string above
echo    2. Run: npm run db:generate
echo    3. Run: npm run db:migrate
echo    4. Run: npm run db:seed
echo.
pause
