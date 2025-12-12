import fs from "node:fs"
import path from "node:path"

const args = new Set(process.argv.slice(2))
const dryRun = args.has("--dry-run")

const targets = [".next"]

function removeTarget(targetPath) {
  const resolved = path.resolve(process.cwd(), targetPath)

  if (!fs.existsSync(resolved)) {
    console.log(`[clean-next] Skipped (not found): ${targetPath}`)
    return
  }

  if (dryRun) {
    console.log(`[clean-next] [dry-run] Would remove: ${targetPath}`)
    return
  }

  try {
    fs.rmSync(resolved, { recursive: true, force: true })
    console.log(`[clean-next] Removed: ${targetPath}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[clean-next] Failed to remove ${targetPath}: ${message}`)
    console.error("[clean-next] If a dev server is running, stop it and try again.")
    process.exitCode = 1
  }
}

for (const target of targets) {
  removeTarget(target)
}
