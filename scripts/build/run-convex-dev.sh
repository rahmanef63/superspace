#!/bin/bash

# Shell script to run Convex development server
# Usage: ./scripts/run-convex-dev.sh

echo " Starting Convex development server..."
echo "Team: abdurrahman-fakhrul"
echo "Project: superspace"
echo "Configuration: existing"
echo "$(printf '%*s' 50 | tr ' ' '-')"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Run the Convex development command
npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Convex development server started successfully!"
else
    echo ""
    echo "❌ Convex development server failed"
    exit 1
fi
