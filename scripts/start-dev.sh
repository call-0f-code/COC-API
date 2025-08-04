#!/bin/bash

# COC API Development Setup Script
# This script starts Supabase, extracts environment variables, and starts the Docker development container

set -e  # Exit on any error

echo "🚀 Starting COC API Development Environment Setup..."

# Function to print colored output
print_status() {
    echo -e "\n\033[1;32m$1\033[0m"
}

print_error() {
    echo -e "\n\033[1;31m$1\033[0m"
}

print_warning() {
    echo -e "\n\033[1;33m$1\033[0m"
}

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    echo "or visit: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    print_error "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Start Supabase
print_status "🔧 Starting Supabase local development..."
supabase start

# Wait a moment for services to fully start
sleep 2

# Get Supabase status and extract environment variables
print_status "📋 Getting Supabase status and extracting environment variables..."
status_output=$(supabase status)

echo "Supabase Status Output:"
echo "$status_output"
echo ""

# Extract URLs and keys from status output
postgres_url=$(echo "$status_output" | grep "DB URL" | awk '{print $3}')
api_url=$(echo "$status_output" | grep "API URL" | awk '{print $3}')
service_role_key=$(echo "$status_output" | grep "service_role key" | awk '{print $3}')

# Validate extracted values
if [ -z "$postgres_url" ] || [ -z "$api_url" ] || [ -z "$service_role_key" ]; then
    print_error "❌ Failed to extract required environment variables from Supabase status."
    print_warning "Please check the Supabase status output above and manually create .env.local file."
    echo "Expected format:"
    echo "DATABASE_URL=your_postgres_url"
    echo "DIRECT_URL=your_postgres_url"
    echo "SUPABASE_URL=your_api_url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Create .env.local file
print_status "📝 Creating .env.local file..."
cat > .env.local << EOF
# Supabase Local Development Environment Variables
# Generated automatically by scripts/start-dev.sh

DATABASE_URL=$postgres_url
DIRECT_URL=$postgres_url
SUPABASE_URL=$api_url
SUPABASE_SERVICE_ROLE_KEY=$service_role_key

# Additional environment variables
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF

print_status "✅ Environment variables written to .env.local:"
echo "DATABASE_URL=$postgres_url"
echo "DIRECT_URL=$postgres_url"
echo "SUPABASE_URL=$api_url"
echo "SUPABASE_SERVICE_ROLE_KEY=$service_role_key"

# Start Docker development container
print_status "🐳 Building Docker image for coc-api-dev..."
docker compose build coc-api-dev
print_status "🐳 Starting Docker development container..."
docker compose up -d coc-api-dev

# Wait for container to start
sleep 3

# Check if container is running
if docker compose ps coc-api-dev | grep -q "Up"; then
    print_status "🎉 Development environment is ready!"
    echo ""
    echo "📝 Summary:"
    echo "  • Supabase local instance: $api_url"
    echo "  • COC API development server: http://localhost:3000"
    echo "  • Environment variables: .env.local"
    echo ""
    echo "🔧 Useful commands:"
    echo "  • View logs: docker compose logs -f coc-api-dev"
    echo "  • Stop services: docker compose down"
    echo "  • Stop Supabase: supabase stop"
    echo "  • Restart script: ./scripts/start-dev.sh"
else
    print_error "❌ Failed to start Docker container. Check the logs:"
    docker compose logs coc-api-dev
    exit 1
fi 