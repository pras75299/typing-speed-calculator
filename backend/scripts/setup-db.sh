#!/bin/bash

# Script to set up database using Docker

echo "🚀 Setting up database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q typing-speed-db; then
    echo "📦 Starting PostgreSQL container..."
    cd "$(dirname "$0")/.."
    docker-compose up -d postgres
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 3
    
    # Wait for PostgreSQL to be ready
    for i in {1..30}; do
        if docker exec typing-speed-db pg_isready -U postgres > /dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ PostgreSQL failed to start"
            exit 1
        fi
        sleep 1
    done
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Run migrations
echo "📝 Running database migrations..."
docker exec -i typing-speed-db psql -U postgres -d typing_speed < "$BACKEND_DIR/migrations/001_initial_schema.sql"

if [ $? -eq 0 ]; then
    echo "✅ Initial schema migration completed"
else
    echo "❌ Initial schema migration failed"
    exit 1
fi

# Run language column migration
if [ -f "$BACKEND_DIR/migrations/002_add_language_column.sql" ]; then
    echo "📝 Running language column migration..."
    docker exec -i typing-speed-db psql -U postgres -d typing_speed < "$BACKEND_DIR/migrations/002_add_language_column.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Language column migration completed"
    else
        echo "⚠️  Language column migration failed (might already exist)"
    fi
fi

# Seed data
echo "🌱 Seeding initial data..."
docker exec -i typing-speed-db psql -U postgres -d typing_speed < "$BACKEND_DIR/seeds/texts.sql"

if [ $? -eq 0 ]; then
    echo "✅ Data seeded successfully"
else
    echo "⚠️  Seed failed (this might be okay if data already exists)"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "You can now start the server with: npm run dev"

