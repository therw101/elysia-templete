#!/bin/bash

# =================================================================
# Setup Script for RMU Part-Time Job Management Backend
# =================================================================

echo "🚀 Setting up RMU Part-Time Job Management Backend..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "📦 Installing dependencies..."
bun install

echo "🔧 Setting up environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ .env file created from env.example"
    echo "📝 Please update .env file with your configurations"
else
    echo "⚠️  .env file already exists"
fi

echo "🗄️  Database setup instructions:"
echo "1. Make sure PostgreSQL is running (via Docker or locally)"
echo "2. Run: bun run db:setup"
echo "3. Or manually execute: backend/database/schema.sql"

echo ""
echo "🎉 Setup completed!"
echo ""
echo "🚀 To start development:"
echo "   bun run dev"
echo ""
echo "🐳 To use Docker:"
echo "   docker-compose -f docker-compose.dev.yml up --build"
echo "" 