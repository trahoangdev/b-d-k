@echo off
echo 🚀 Setting up Big Data Keeper Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please update .env file with your configuration before continuing.
    echo    - Database connection string
    echo    - JWT secret key
    echo    - MinIO credentials
    echo    - Redis connection
    pause
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Check database connection
echo 🔍 Checking database connection...
npm run db:migrate
if %errorlevel% neq 0 (
    echo ❌ Database connection failed. Please check your DATABASE_URL in .env file.
    pause
    exit /b 1
)

REM Seed database
echo 🌱 Seeding database...
npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Start the development server: npm run dev
echo 2. API will be available at: http://localhost:3001
echo 3. Health check: http://localhost:3001/health
echo 4. API documentation: http://localhost:3001/api
echo.
echo 🔑 Default credentials:
echo    Admin: admin@bigdatakeeper.com / admin123
echo    User:  user@bigdatakeeper.com / user123
echo.
echo Happy coding! 🚀
pause
