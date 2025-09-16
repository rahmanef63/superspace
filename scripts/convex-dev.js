#!/usr/bin/env node
/**
 * Script to run Convex development server with the specified configuration.
 * This script runs: npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace
 */

const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

function runConvexDev() {
  console.log("🚀 Starting Convex development server...")
  console.log("Team: abdurrahman-fakhrul")
  console.log("Project: superspace")
  console.log("Configuration: existing")
  console.log("-".repeat(50))

  // Command arguments
  const args = ["convex", "dev", "--configure=existing", "--team", "abdurrahman-fakhrul", "--project", "superspace"]

  // Spawn the process
  const process = spawn("npx", args, {
    stdio: "inherit", // This will pipe stdout/stderr to the parent process
    shell: true,
  })

  // Handle process events
  process.on("close", (code) => {
    if (code === 0) {
      console.log("\n✅ Convex development server started successfully!")
    } else {
      console.log(`\n❌ Convex development server failed with exit code: ${code}`)
      process.exit(code)
    }
  })

  process.on("error", (error) => {
    if (error.code === "ENOENT") {
      console.log("❌ Error: npx not found. Please make sure Node.js and npm are installed.")
    } else {
      console.log(`❌ Error running Convex development server: ${error.message}`)
    }
    process.exit(1)
  })

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n🛑 Convex development server stopped by user")
    process.kill()
    process.exit(0)
  })
}

// Check if we're in the right directory (should have package.json)
if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
  console.log("❌ Error: package.json not found. Please run this script from the project root.")
  process.exit(1)
}

runConvexDev()
