#!/usr/bin/env node
/**
 * Feature Pages Validation Script
 *
 * Validates that all features defined in features.config.ts have corresponding page files.
 * This helps catch missing pages early during development.
 *
 * Usage: pnpm run validate:pages
 */

import { existsSync } from "fs"
import { join } from "path"
import { getAllFeatures } from "../../lib/features/registry.server"

const FEATURES_REGISTRY = getAllFeatures()

const rootDir = process.cwd()

interface ValidationResult {
  slug: string
  name: string
  component: string
  expectedPath: string
  exists: boolean
  featureType: string
  isReady?: boolean
}

/**
 * ✅ 100% DYNAMIC - Auto-resolves expected page path from feature slug
 * NO hardcoding! All paths derived from feature folder structure
 */
function getExpectedPagePath(slug: string, component: string): string {
  // slug is the actual folder name (e.g., 'menu-store', not 'menus')
  // Check multiple possible locations (priority order)
  const possiblePaths = [
    `frontend/features/${slug}/page.tsx`, // Next.js page component (MOST COMMON)
    `frontend/features/${slug}/views/${component}.tsx`,
    `frontend/features/${slug}/index.ts`,
    `frontend/views/static/${slug}/page.tsx`,
    `frontend/views/dynamic/${slug}/page.tsx`,
  ]

  // Return first existing path, or default to recommended structure
  for (const path of possiblePaths) {
    if (existsSync(join(rootDir, path))) {
      return path
    }
  }

  // Default: Recommended structure (views/{Component}.tsx)
  return `frontend/features/${slug}/views/${component}.tsx`
}

function validateFeaturePages(): ValidationResult[] {
  const results: ValidationResult[] = []

  for (const feature of FEATURES_REGISTRY) {
    // Access metadata attached by registry.server.ts
    const meta = (feature as any).__meta
    const slug = meta?.slug || feature.id // Fallback to id if no slug
    const component = feature.ui.component

    const expectedPath = getExpectedPagePath(slug, component)
    const fullPath = join(rootDir, expectedPath)
    const exists = existsSync(fullPath)

    results.push({
      slug,
      name: feature.name,
      component,
      expectedPath,
      exists,
      featureType: feature.technical.featureType, // Fixed: was feature.featureType
      isReady: feature.status.isReady, // Fixed: was feature.isReady
    })
  }

  return results
}

function generateReport(results: ValidationResult[]) {
  console.log("\n Feature Pages Validation Report")
  console.log("=" .repeat(80))

  const missing = results.filter(r => !r.exists)
  const existing = results.filter(r => r.exists)
  const missingOptional = missing.filter(r => r.featureType === "optional")
  const missingDefault = missing.filter(r => r.featureType === "default" || r.featureType === "system")

  console.log(`\n✅ Existing Pages: ${existing.length}/${results.length}`)
  console.log(`❌ Missing Pages: ${missing.length}/${results.length}`)

  if (missingDefault.length > 0) {
    console.log("\n⚠️  CRITICAL: Missing Default/System Feature Pages:")
    console.log("-".repeat(80))
    missingDefault.forEach(r => {
      console.log(`  ❌ ${r.name} (${r.slug})`)
      console.log(`     Component: ${r.component}`)
      console.log(`     Expected: ${r.expectedPath}`)
      console.log()
    })
  }

  if (missingOptional.length > 0) {
    console.log("\n⚠️  Missing Optional Feature Pages:")
    console.log("-".repeat(80))
    missingOptional.forEach(r => {
      const status = r.isReady ? "❌ READY but missing" : "⚠️  In development"
      console.log(`  ${status}: ${r.name} (${r.slug})`)
      console.log(`     Component: ${r.component}`)
      console.log(`     Expected: ${r.expectedPath}`)
      console.log()
    })
  }

  if (missing.length === 0) {
    console.log("\n All feature pages exist!")
  }

  // Group by feature type
  console.log("\n📁 Pages by Feature Type:")
  console.log("-".repeat(80))
  const byType = results.reduce((acc, r) => {
    if (!acc[r.featureType]) acc[r.featureType] = { total: 0, existing: 0 }
    acc[r.featureType].total++
    if (r.exists) acc[r.featureType].existing++
    return acc
  }, {} as Record<string, { total: number; existing: number }>)

  Object.entries(byType).forEach(([type, stats]) => {
    const emoji = stats.existing === stats.total ? "✅" : "⚠️ "
    console.log(`  ${emoji} ${type}: ${stats.existing}/${stats.total}`)
  })

  return missing.length === 0
}

function main() {
  console.log("🔍 Validating feature pages...\n")

  const results = validateFeaturePages()
  const allValid = generateReport(results)

  console.log("\n" + "=".repeat(80))

  if (!allValid) {
    console.log("\n❌ Validation failed: Some feature pages are missing")
    console.log("\nTo fix:")
    console.log("  1. Create missing page files at the expected paths")
    console.log("  2. Or update features.config.ts to mark features as not ready")
    console.log("  3. Run 'pnpm run generate:manifest' to update manifest")
    console.log("  4. Run this validation again\n")
    process.exit(1)
  }

  console.log("\n✅ All feature pages validated successfully!\n")
}

main()
