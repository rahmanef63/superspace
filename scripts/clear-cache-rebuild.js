/**
 * Script to clear Next.js cache and rebuild the project
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

function runCommand(command, description) {
  console.log(`🔄 ${description}...`)
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "pipe" })
    console.log(`✅ ${description} completed successfully`)
    if (output.trim()) {
      console.log(`   Output: ${output.trim()}`)
    }
    return true
  } catch (error) {
    console.log(`❌ ${description} failed`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

function clearCacheDirectories() {
  const cacheDirs = [".next", "node_modules/.cache", ".vercel", "dist", "build"]

  cacheDirs.forEach((cacheDir) => {
    if (fs.existsSync(cacheDir)) {
      console.log(`🗑️  Removing ${cacheDir}...`)
      try {
        fs.rmSync(cacheDir, { recursive: true, force: true })
        console.log(`✅ Removed ${cacheDir}`)
      } catch (error) {
        console.log(`❌ Failed to remove ${cacheDir}: ${error.message}`)
      }
    } else {
      console.log(`ℹ️  ${cacheDir} doesn't exist, skipping`)
    }
  })
}

function main() {
  console.log("🚀 Starting cache clear and rebuild process...")
  console.log("=".repeat(50))

  // Change to project root if script is run from scripts directory
  if (path.basename(process.cwd()) === "scripts") {
    process.chdir("..")
  }

  // Step 1: Clear cache directories
  console.log("\n📁 Clearing cache directories...")
  clearCacheDirectories()

  // Step 2: Clear npm cache
  console.log("\n📦 Clearing npm cache...")
  runCommand("npm cache clean --force", "NPM cache clean")

  // Step 3: Remove node_modules and reinstall
  console.log("\n🔄 Reinstalling dependencies...")
  if (fs.existsSync("node_modules")) {
    console.log("🗑️  Removing node_modules...")
    fs.rmSync("node_modules", { recursive: true, force: true })
  }

  if (!runCommand("npm install", "Installing dependencies")) {
    console.log("❌ Failed to install dependencies. Exiting.")
    process.exit(1)
  }

  // Step 4: Run Convex dev setup
  console.log("\n⚡ Setting up Convex...")
  runCommand("npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace", "Convex setup")

  // Step 5: Build the project
  console.log("\n🏗️  Building project...")
  if (!runCommand("npm run build", "Building project")) {
    console.log("❌ Build failed. Check the errors above.")
    process.exit(1)
  }

  console.log("\n🎉 Cache clear and rebuild completed successfully!")
  console.log("You can now run 'npm run dev' to start the development server.")
}

main()
