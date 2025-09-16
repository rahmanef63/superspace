#!/bin/bash

echo "🚀 Starting cache clear and rebuild process..."
echo "=================================================="

# Change to project root if script is run from scripts directory
if [ "$(basename "$PWD")" = "scripts" ]; then
    cd ..
fi

# Step 1: Clear cache directories
echo ""
echo "📁 Clearing cache directories..."
for dir in .next node_modules/.cache .vercel dist build; do
    if [ -d "$dir" ]; then
        echo "🗑️  Removing $dir..."
        rm -rf "$dir"
        echo "✅ Removed $dir"
    else
        echo "ℹ️  $dir doesn't exist, skipping"
    fi
done

# Step 2: Clear npm cache
echo ""
echo "📦 Clearing npm cache..."
npm cache clean --force

# Step 3: Remove node_modules and reinstall
echo ""
echo "🔄 Reinstalling dependencies..."
if [ -d "node_modules" ]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Exiting."
    exit 1
fi

# Step 4: Run Convex dev setup
echo ""
echo "⚡ Setting up Convex..."
npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace

# Step 5: Build the project
echo ""
echo "🏗️  Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check the errors above."
    exit 1
fi

echo ""
echo "🎉 Cache clear and rebuild completed successfully!"
echo "You can now run 'npm run dev' to start the development server."
