#!/usr/bin/env python3
"""
Script to clear Next.js cache and rebuild the project
"""

import os
import subprocess
import shutil
import sys
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"   Error: {e.stderr.strip()}")
        return False

def clear_cache_directories():
    """Clear Next.js cache directories"""
    cache_dirs = [
        ".next",
        "node_modules/.cache",
        ".vercel",
        "dist",
        "build"
    ]
    
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            print(f"🗑️  Removing {cache_dir}...")
            try:
                shutil.rmtree(cache_dir)
                print(f"✅ Removed {cache_dir}")
            except Exception as e:
                print(f"❌ Failed to remove {cache_dir}: {e}")
        else:
            print(f"ℹ️  {cache_dir} doesn't exist, skipping")

def main():
    print("🚀 Starting cache clear and rebuild process...")
    print("=" * 50)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    # Step 1: Clear cache directories
    print("\n📁 Clearing cache directories...")
    clear_cache_directories()
    
    # Step 2: Clear npm cache
    print("\n📦 Clearing npm cache...")
    run_command("npm cache clean --force", "NPM cache clean")
    
    # Step 3: Remove node_modules and reinstall
    print("\n🔄 Reinstalling dependencies...")
    if os.path.exists("node_modules"):
        print("🗑️  Removing node_modules...")
        shutil.rmtree("node_modules")
    
    if not run_command("npm install", "Installing dependencies"):
        print("❌ Failed to install dependencies. Exiting.")
        sys.exit(1)
    
    # Step 4: Run Convex dev setup
    print("\n⚡ Setting up Convex...")
    run_command("npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace", "Convex setup")
    
    # Step 5: Build the project
    print("\n🏗️  Building project...")
    if not run_command("npm run build", "Building project"):
        print("❌ Build failed. Check the errors above.")
        sys.exit(1)
    
    print("\n🎉 Cache clear and rebuild completed successfully!")
    print("You can now run 'npm run dev' to start the development server.")

if __name__ == "__main__":
    main()
