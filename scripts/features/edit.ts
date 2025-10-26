#!/usr/bin/env node
/**
 * Feature Edit Script (CRUD - Update)
 *
 * Edits an existing feature configuration with optional maintenance mode.
 *
 * When edited, the feature can:
 * - Enter maintenance mode (users see a maintenance message)
 * - Rollback to previous version if needed
 * - Notify frontend about the maintenance state
 *
 * Usage: pnpm run edit:feature <slug> [options]
 *
 * Examples:
 *   pnpm run edit:feature analytics --maintenance
 *   pnpm run edit:feature analytics --set-ready true
 *   pnpm run edit:feature analytics --status stable
 *   pnpm run edit:feature analytics --version 2.0.0
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs"
import { join } from "path"

interface EditOptions {
  slug: string
  maintenance?: boolean
  setReady?: boolean
  status?: "development" | "beta" | "stable" | "deprecated"
  version?: string
  name?: string
  description?: string
  icon?: string
  permissions?: string[]
  rollback?: boolean
}

function parseArgs(): EditOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Feature Edit CLI

Usage: pnpm run edit:feature <slug> [options]

Arguments:
  slug                Feature slug to edit

Options:
  --maintenance       Put feature in maintenance mode (users will see maintenance message)
  --no-maintenance    Remove maintenance mode
  --set-ready         Set isReady status: true|false
  --status            Set development status: development|beta|stable|deprecated
  --version           Update version (semver, e.g., 2.0.0)
  --name              Update display name
  --description       Update description
  --icon              Update icon (Lucide React icon name)
  --permissions       Update permissions (comma-separated)
  --rollback          Rollback to backup version (if exists)
  --backup            Create backup before editing

Examples:
  pnpm run edit:feature analytics --maintenance
  pnpm run edit:feature analytics --set-ready true --status stable
  pnpm run edit:feature analytics --version 2.0.0 --backup
  pnpm run edit:feature analytics --rollback
  pnpm run edit:feature analytics --name "Advanced Analytics" --icon BarChart3
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("--")) {
    console.error("❌ Error: Feature slug is required")
    console.error("   Usage: pnpm run edit:feature <slug> [options]")
    process.exit(1)
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag)
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined
  }

  const hasFlag = (flag: string): boolean => args.includes(flag)

  const maintenance = hasFlag("--maintenance")
    ? true
    : hasFlag("--no-maintenance")
      ? false
      : undefined
  const setReadyArg = getArg("--set-ready")
  const setReady = setReadyArg ? setReadyArg === "true" : undefined
  const status = getArg("--status") as EditOptions["status"]
  const version = getArg("--version")
  const name = getArg("--name")
  const description = getArg("--description")
  const icon = getArg("--icon")
  const permissionsArg = getArg("--permissions")
  const permissions = permissionsArg ? permissionsArg.split(",").map((p) => p.trim()) : undefined
  const rollback = hasFlag("--rollback")

  return {
    slug,
    maintenance,
    setReady,
    status,
    version,
    name,
    description,
    icon,
    permissions,
    rollback,
  }
}

function createBackup(configPath: string): string {
  const backupPath = configPath.replace(".ts", ".backup.ts")
  copyFileSync(configPath, backupPath)
  return backupPath
}

function restoreBackup(configPath: string, backupPath: string): void {
  if (!existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }
  copyFileSync(backupPath, configPath)
}

function updateConfigFile(
  configPath: string,
  updates: Partial<EditOptions>,
  previousVersion?: string
): void {
  let content = readFileSync(configPath, "utf-8")

  // Update name
  if (updates.name) {
    content = content.replace(/name: ['"].*?['"]/, `name: '${updates.name}'`)
  }

  // Update description
  if (updates.description) {
    content = content.replace(/description: ['"].*?['"]/, `description: '${updates.description}'`)
  }

  // Update icon
  if (updates.icon) {
    content = content.replace(/icon: ['"].*?['"]/, `icon: '${updates.icon}'`)
  }

  // Update version
  if (updates.version) {
    content = content.replace(/version: ['"].*?['"]/, `version: '${updates.version}'`)

    // Add previousVersion if not exists
    if (previousVersion && !content.includes("previousVersion:")) {
      content = content.replace(
        /version: ['"].*?['"]/,
        `version: '${updates.version}',\n    previousVersion: '${previousVersion}'`
      )
    } else if (previousVersion) {
      content = content.replace(/previousVersion: ['"].*?['"]/, `previousVersion: '${previousVersion}'`)
    }
  }

  // Update status
  if (updates.status) {
    content = content.replace(/state: ['"].*?['"]/, `state: '${updates.status}'`)
  }

  // Update isReady
  if (updates.setReady !== undefined) {
    content = content.replace(/isReady: (true|false)/, `isReady: ${updates.setReady}`)
  }

  // Update maintenance mode
  if (updates.maintenance !== undefined) {
    // Check if inMaintenance exists
    if (content.includes("inMaintenance:")) {
      content = content.replace(/inMaintenance: (true|false)/, `inMaintenance: ${updates.maintenance}`)
    } else {
      // Add inMaintenance field to status object
      content = content.replace(
        /status: \{/,
        `status: {\n    inMaintenance: ${updates.maintenance},`
      )
    }

    // Add maintenance message if entering maintenance
    if (updates.maintenance && !content.includes("maintenanceMessage:")) {
      const maintenanceMsg = `This feature is currently undergoing maintenance. Please check back later.`
      content = content.replace(
        /inMaintenance: true,/,
        `inMaintenance: true,\n    maintenanceMessage: '${maintenanceMsg}',`
      )
    }
  }

  // Update permissions
  if (updates.permissions) {
    const permStr = JSON.stringify(updates.permissions, null, 4)
    if (content.includes("permissions:")) {
      content = content.replace(/permissions: \[[\s\S]*?\]/, `permissions: ${permStr}`)
    } else {
      // Add permissions field
      content = content.replace(/tags: \[[\s\S]*?\]/, (match) => `${match},\n\n  permissions: ${permStr}`)
    }
  }

  writeFileSync(configPath, content)
}

function main() {
  console.log("✏️  Feature Edit Script\n")

  const options = parseArgs()
  const { slug, rollback } = options

  const rootDir = process.cwd()
  const configPath = join(rootDir, "frontend", "features", slug, "config.ts")
  const backupPath = configPath.replace(".ts", ".backup.ts")

  // Check if feature exists
  if (!existsSync(configPath)) {
    console.error(`❌ Error: Feature "${slug}" not found`)
    console.error(`   Expected: ${configPath}`)
    console.error(`\n💡 Tip: Run 'pnpm run list:features' to see available features`)
    process.exit(1)
  }

  // Handle rollback
  if (rollback) {
    console.log(`🔄 Rolling back feature "${slug}" to backup version...`)

    if (!existsSync(backupPath)) {
      console.error(`❌ Error: No backup found for "${slug}"`)
      console.error(`   Expected: ${backupPath}`)
      process.exit(1)
    }

    restoreBackup(configPath, backupPath)
    console.log(`✅ Rolled back to backup successfully!`)
    console.log(`\n📋 Next steps:`)
    console.log(`   1. Run 'pnpm run sync:all' to sync changes`)
    console.log(`   2. Run 'pnpm run validate:features' to validate\n`)
    return
  }

  // Read current config to get version
  const currentContent = readFileSync(configPath, "utf-8")
  const versionMatch = currentContent.match(/version: ['"]([^'"]+)['"]/)
  const currentVersion = versionMatch ? versionMatch[1] : undefined

  // Create backup if --backup flag or version change
  if (process.argv.includes("--backup") || options.version) {
    console.log(`💾 Creating backup...`)
    const backup = createBackup(configPath)
    console.log(`   ✅ Backup created: ${backup}`)
  }

  console.log(`📝 Editing feature: ${slug}`)
  console.log(`   Location: ${configPath}\n`)

  // Apply updates
  const updates: Partial<EditOptions> = {}
  const changes: string[] = []

  if (options.maintenance !== undefined) {
    updates.maintenance = options.maintenance
    changes.push(`Maintenance mode: ${options.maintenance ? "ENABLED" : "DISABLED"}`)
  }
  if (options.setReady !== undefined) {
    updates.setReady = options.setReady
    changes.push(`Ready status: ${options.setReady ? "READY" : "NOT READY"}`)
  }
  if (options.status) {
    updates.status = options.status
    changes.push(`Status: ${options.status}`)
  }
  if (options.version) {
    updates.version = options.version
    changes.push(`Version: ${currentVersion} → ${options.version}`)
  }
  if (options.name) {
    updates.name = options.name
    changes.push(`Name: ${options.name}`)
  }
  if (options.description) {
    updates.description = options.description
    changes.push(`Description: ${options.description}`)
  }
  if (options.icon) {
    updates.icon = options.icon
    changes.push(`Icon: ${options.icon}`)
  }
  if (options.permissions) {
    updates.permissions = options.permissions
    changes.push(`Permissions: ${options.permissions.join(", ")}`)
  }

  if (changes.length === 0) {
    console.log("⚠️  No changes specified. Use --help to see available options.")
    process.exit(0)
  }

  console.log("📋 Changes to apply:")
  changes.forEach((c) => console.log(`   - ${c}`))
  console.log("")

  // Update config file
  updateConfigFile(configPath, updates, currentVersion)

  console.log("✅ Feature updated successfully!\n")

  if (options.maintenance) {
    console.log("🚧 Maintenance Mode ENABLED")
    console.log("   Users will see a maintenance message when accessing this feature")
    console.log("   Previous version will be used until maintenance is disabled\n")
  }

  console.log("📋 Next steps:")
  console.log(`   1. Review changes in: ${configPath}`)
  console.log(`   2. Run 'pnpm run sync:all' to sync changes`)
  console.log(`   3. Run 'pnpm run validate:features' to validate`)

  if (options.maintenance) {
    console.log(`   4. When done, run: pnpm run edit:feature ${slug} --no-maintenance`)
  }

  if (existsSync(backupPath)) {
    console.log(`\n💡 Backup available: ${backupPath}`)
    console.log(`   To rollback: pnpm run edit:feature ${slug} --rollback`)
  }

  console.log("")
}

main()
