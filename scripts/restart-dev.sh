#!/bin/bash

# COC API Development Environment Restart Script
# This script restarts the entire development environment

set -e  # Exit on any error

echo "🔄 Restarting COC API Development Environment..."

# Function to print colored output
print_status() {
    echo -e "\n\033[1;32m$1\033[0m"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Stop the development environment
print_status "🛑 Stopping development environment..."
bash "$SCRIPT_DIR/stop-dev.sh"

# Wait a moment before restarting
sleep 2

# Start the development environment
print_status "🚀 Starting development environment..."
bash "$SCRIPT_DIR/start-dev.sh" 