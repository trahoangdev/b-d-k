#!/bin/bash

echo "🚀 Setting up Big Data Keeper Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration before continuing."
    echo "   - Database connection string"
    echo "   - JWT secret key"
    echo "   - MinIO credentials"
    echo "   - Redis connection"
    read -p "Press Enter to continue after updating .env file..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check database connection
echo "🔍 Checking database connection..."
if npm run db:migrate; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env file."
    exit 1
fi

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. API will be available at: http://localhost:3001"
echo "3. Health check: http://localhost:3001/health"
echo "4. API documentation: http://localhost:3001/api"
echo ""
echo "🔑 Default credentials:"
echo "   Admin: admin@bigdatakeeper.com / admin123"
echo "   User:  user@bigdatakeeper.com / user123"
echo ""
echo "Happy coding! 🚀"
