#!/bin/bash

echo "====================================================="
echo "Big Data Keeper - PostgreSQL Database Setup (Linux/Mac)"
echo "====================================================="
echo

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) not found!"
    echo "Please install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  CentOS/RHEL: sudo yum install postgresql"
    echo "  macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL client found"
echo

# Get database connection details
read -p "Enter PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter PostgreSQL port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter PostgreSQL superuser (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

echo
echo "🔧 Creating database and user..."
echo

# Create database and user
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -f quick-setup.sql

if [ $? -ne 0 ]; then
    echo "❌ Database setup failed!"
    echo "Please check your PostgreSQL connection and try again."
    exit 1
fi

echo
echo "✅ Database setup completed successfully!"
echo
echo "📋 Connection Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: big_data_keeper"
echo "   User: big_data_keeper_user"
echo "   Password: big_data_keeper_password_2024"
echo
echo "🔗 Connection String:"
echo "   postgresql://big_data_keeper_user:big_data_keeper_password_2024@$DB_HOST:$DB_PORT/big_data_keeper"
echo
echo "📝 Next Steps:"
echo "   1. Update your .env file with the connection string above"
echo "   2. Run: npm run db:generate"
echo "   3. Run: npm run db:migrate"
echo "   4. Run: npm run db:seed"
echo
