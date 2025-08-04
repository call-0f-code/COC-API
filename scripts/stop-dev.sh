#!/bin/bash

# COC API Development Environment Stop Script
# This script stops the Docker development container and Supabase local instance

set -e  # Exit on any error

echo "🛑 Stopping COC API Development Environment..."

# Function to print colored output
print_status() {
    echo -e "\n\033[1;32m$1\033[0m"
}

print_error() {
    echo -e "\n\033[1;31m$1\033[0m"
}

# Stop Docker containers
print_status "🐳 Stopping Docker containers..."
if docker compose ps --services --filter "status=running" | grep -q "^coc-api-dev$"; then
    docker compose down
    echo "✅ Docker containers stopped"
else
    echo "ℹ️  Docker containers were not running"
fi

# Stop Supabase
print_status "🔧 Stopping Supabase local instance..."
if command -v supabase &> /dev/null; then
    supabase stop
    echo "✅ Supabase stopped"
else
    print_error "❌ Supabase CLI not found"
fi

print_status "🎉 Development environment stopped successfully!"
echo ""
echo "🔧 To start again, run: ./scripts/start-dev.sh" 