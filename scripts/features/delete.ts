#!/usr/bin/env node
/**
 * Feature Delete Script (CRUD - Delete)
 *
 * Safely deletes a feature from the system.
 *
 * Usage: pnpm run delete:feature <slug> [options]
 *
 * Examples:
 *   pnpm run delete:feature analytics --confirm
 *   pnpm run delete:feature analytics --confirm --keep-data
 */

import { rmSync, existsSync, renameSync } from "fs"
import { join } from "path"
import { getAllFeatures } from "../../lib/features/registry.server"

interface DeleteOptions {
  slug: string
  confirm: boolean
  keepData: boolean
  archive: boolean
}

function parseArgs(): DeleteOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Feature Delete CLI

Usage: pnpm run delete:feature <slug> [options]

Arguments:
  slug                Feature slug to delete

Options:
  --confirm           Required: Confirm deletion (safety check)
  --keep-data         Keep Convex data (only remove code)
  --archive           Archive feature instead of deleting

Examples:
  pnpm run delete:feature my-feature --confirm
  pnpm run delete:feature my-feature --confirm --keep-data
  pnpm run delete:feature my-feature --archive

⚠️  WARNING: This will permanently delete the feature code!
    Use --archive to safely move it to archive/ folder instead.
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("--")) {
    console.error("❌ Error: Feature slug is required")
    console.error("   Usage: pnpm run delete:feature <slug> --confirm")
    process.exit(1)
  }

  const confirm = args.includes("--confirm")
  const keepData = args.includes("--keep-data")
  const archive = args.includes("--archive")

  return { slug, confirm, keepData, archive }
}

function archiveFeature(slug: string, featureDir: string, convexDir: string, testsDir: string): void {
  const rootDir = process.cwd()
  const archiveDir = join(rootDir, "archive", "features", slug)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const archivePath = `${archiveDir}-${timestamp}`

  console.log(`📦 Archiving feature to: ${archivePath}`)

  // Archive frontend
  if (existsSync(featureDir)) {
    const archiveFrontend = join(archivePath, "frontend")
    renameSync(featureDir, archiveFrontend)
    console.log(`   ✅ Archived frontend`)
  }

  // Archive convex
  if (existsSync(convexDir)) {
    const archiveConvex = join(archivePath, "convex")
    renameSync(convexDir, archiveConvex)
    console.log(`   ✅ Archived Convex handlers`)
  }

  // Archive tests
  if (existsSync(testsDir)) {
    const archiveTests = join(archivePath, "tests")
    renameSync(testsDir, archiveTests)
    console.log(`   ✅ Archived tests`)
  }

  console.log(`\n✅ Feature archived successfully!`)
  console.log(`   Location: ${archivePath}`)
  console.log(`\n💡 To restore: Move folders back to original locations`)
}

function deleteFeature(slug: string, featureDir: string, convexDir: string, testsDir: string, keepData: boolean): void {
  let deleted = 0

  // Delete frontend
  if (existsSync(featureDir)) {
    rmSync(featureDir, { recursive: true, force: true })
    console.log(`   ✅ Deleted frontend: ${featureDir}`)
    deleted++
  }

  // Delete convex (unless --keep-data)
  if (!keepData && existsSync(convexDir)) {
    rmSync(convexDir, { recursive: true, force: true })
    console.log(`   ✅ Deleted Convex handlers: ${convexDir}`)
    deleted++
  } else if (keepData && existsSync(convexDir)) {
    console.log(`   ⏭️  Skipped Convex handlers (--keep-data): ${convexDir}`)
  }

  // Delete tests
  if (existsSync(testsDir)) {
    rmSync(testsDir, { recursive: true, force: true })
    console.log(`   ✅ Deleted tests: ${testsDir}`)
    deleted++
  }

  if (deleted === 0) {
    console.log(`   ⚠️  No files found to delete`)
  }
}

function main() {
  console.log("🗑️  Feature Delete Script\n")

  const options = parseArgs()
  const { slug, confirm, keepData, archive } = options

  // Require confirmation
  if (!confirm && !archive) {
    console.error("❌ Error: --confirm flag is required for safety")
    console.error("   This will permanently delete the feature!")
    console.error(`\n   Usage: pnpm run delete:feature ${slug} --confirm`)
    console.error(`   Or use: pnpm run delete:feature ${slug} --archive (safer)`)
    process.exit(1)
  }

  const rootDir = process.cwd()
  const featureDir = join(rootDir, "frontend", "features", slug)
  const convexDir = join(rootDir, "convex", "features", slug)
  const testsDir = join(rootDir, "tests", "features", slug)

  // Check if feature exists
  if (!existsSync(featureDir)) {
    console.error(`❌ Error: Feature "${slug}" not found`)
    console.error(`   Expected: ${featureDir}`)
    console.error(`\n💡 Tip: Run 'pnpm run list:features' to see available features`)
    process.exit(1)
  }

  // Show what will be deleted/archived
  console.log(`📋 Feature: ${slug}`)
  console.log(`   Frontend: ${existsSync(featureDir) ? "EXISTS" : "NOT FOUND"}`)
  console.log(`   Convex: ${existsSync(convexDir) ? "EXISTS" : "NOT FOUND"}`)
  console.log(`   Tests: ${existsSync(testsDir) ? "EXISTS" : "NOT FOUND"}`)
  console.log("")

  // Check if feature is in registry (auto-discovered)
  try {
    const features = getAllFeatures()
    const feature = features.find((f) => f.id === slug)

    if (feature) {
      console.log(`⚠️  Warning: This feature is currently registered in the system`)
      console.log(`   Type: ${feature.technical.featureType}`)
      console.log(`   Status: ${feature.status.state} (${feature.status.isReady ? "ready" : "not ready"})`)
      console.log("")
    }
  } catch (error) {
    // Registry might fail if feature has errors, proceed anyway
  }

  // Confirm deletion
  if (archive) {
    console.log(`📦 ARCHIVE MODE: Feature will be moved to archive/ folder`)
  } else {
    console.log(`⚠️  WARNING: This will PERMANENTLY DELETE the feature!`)
    if (keepData) {
      console.log(`   (Convex data will be kept: --keep-data flag)`)
    }
  }

  console.log("")

  // Execute
  if (archive) {
    archiveFeature(slug, featureDir, convexDir, testsDir)
  } else {
    console.log(`🗑️  Deleting feature "${slug}"...`)
    deleteFeature(slug, featureDir, convexDir, testsDir, keepData)
    console.log(`\n✅ Feature deleted successfully!`)
  }

  // Next steps
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Run 'pnpm run sync:all' to update manifests`)
  console.log(`   2. Run 'pnpm run validate:features' to validate`)

  if (!keepData) {
    console.log(`   3. Check Convex database for orphaned data`)
    console.log(`   4. Update any features that depend on "${slug}"`)
  }

  if (archive) {
    console.log(`\n💡 To restore: Move archived folders back to original locations`)
  }

  console.log("")
}

main()
