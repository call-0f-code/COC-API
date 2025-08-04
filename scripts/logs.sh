#!/bin/bash

# COC API Development Logs Script
# This script shows logs from the Docker development container

echo "📋 Viewing COC API Development Container Logs..."
echo "Press Ctrl+C to exit"
echo ""

# Check if container is running
if docker compose ps coc-api-dev | grep -q "Up"; then
    docker compose logs -f coc-api-dev
else
    echo "❌ COC API development container is not running"
    echo "Start it with: ./scripts/start-dev.sh"
    exit 1
fi 