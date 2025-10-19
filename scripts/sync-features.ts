#!/usr/bin/env node
/**
 * Feature Sync Script
 *
 * Synchronizes features.config.ts with:
 * - convex/menu/store/menu_manifest_data.ts (DEFAULT_MENU_ITEMS)
 * - Menu Store catalog (optional features)
 *
 * Usage: pnpm run sync:features
 *
 * This script ensures that:
 * 1. All default features from features.config.ts are in DEFAULT_MENU_ITEMS
 * 2. All optional features are available in the catalog
 * 3. No divergence between config and manifest
 */

import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { FEATURES_REGISTRY, getAllDefaultMenuItems, getOptionalFeaturesCatalog } from "../features.config"

const rootDir = process.cwd()

// ============================================================================
// SYNC DEFAULT MENU ITEMS
// ============================================================================

function syncDefaultMenuItems() {
  console.log("\n📝 Syncing DEFAULT_MENU_ITEMS...")

  const manifestPath = join(rootDir, "convex", "menu", "store", "menu_manifest_data.ts")
  const menuItems = getAllDefaultMenuItems()

  const content = `// This is the single source of truth for default menu items.
// It is safe to import in Convex server functions.
//
// ⚠️  AUTO-GENERATED - DO NOT EDIT MANUALLY
// This file is generated from features.config.ts
// Run 'pnpm run sync:features' to update

export const DEFAULT_MENU_ITEMS = ${JSON.stringify(menuItems, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/: "([a-z]+)"/gi, ': "$1" as const')}
`

  writeFileSync(manifestPath, content)
  console.log(`  ✓ Synced ${menuItems.length} default features to ${manifestPath}`)
}

// ============================================================================
// SYNC OPTIONAL FEATURES CATALOG
// ============================================================================

function syncOptionalFeaturesCatalog() {
  console.log("\n📝 Syncing optional features catalog...")

  const catalogPath = join(rootDir, "convex", "menu", "store", "optional_features_catalog.ts")
  const catalog = getOptionalFeaturesCatalog()

  const content = `/**
 * Optional Features Catalog
 *
 * Available features that can be installed from the Menu Store.
 *
 * ⚠️  AUTO-GENERATED - DO NOT EDIT MANUALLY
 * This file is generated from features.config.ts
 * Run 'pnpm run sync:features' to update
 */

export const OPTIONAL_FEATURES_CATALOG = ${JSON.stringify(catalog, null, 2)}
`

  writeFileSync(catalogPath, content)
  console.log(`  ✓ Synced ${catalog.length} optional features to ${catalogPath}`)
}

// ============================================================================
// VALIDATE FEATURES
// ============================================================================

function validateFeatures() {
  console.log("\n✅ Validating features...")

  const errors: string[] = []

  // Check for duplicate slugs
  const slugs = new Set<string>()
  const flattenFeatures = (features: any[]): any[] => {
    return features.flatMap(f => [f, ...(f.children ? flattenFeatures(f.children) : [])])
  }

  flattenFeatures(FEATURES_REGISTRY).forEach(feature => {
    if (slugs.has(feature.slug)) {
      errors.push(`Duplicate slug found: ${feature.slug}`)
    }
    slugs.add(feature.slug)
  })

  // Check for missing required fields
  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.name) errors.push(`Feature ${feature.slug} missing name`)
    if (!feature.component) errors.push(`Feature ${feature.slug} missing component`)
    if (!feature.path) errors.push(`Feature ${feature.slug} missing path`)
    if (!feature.icon) errors.push(`Feature ${feature.slug} missing icon`)
  })

  if (errors.length > 0) {
    console.error("\n❌ Validation errors:")
    errors.forEach(err => console.error(`  - ${err}`))
    process.exit(1)
  }

  console.log(`  ✓ Validated ${FEATURES_REGISTRY.length} features`)
}

// ============================================================================
// GENERATE FEATURE REPORT
// ============================================================================

function generateReport() {
  console.log("\n📊 Feature Report:")
  console.log("==================")

  const defaultCount = FEATURES_REGISTRY.filter(f => f.featureType === "default").length
  const systemCount = FEATURES_REGISTRY.filter(f => f.featureType === "system").length
  const optionalCount = FEATURES_REGISTRY.filter(f => f.featureType === "optional").length
  const experimentalCount = FEATURES_REGISTRY.filter(f => f.featureType === "experimental").length

  console.log(`  Total features: ${FEATURES_REGISTRY.length}`)
  console.log(`    - Default: ${defaultCount}`)
  console.log(`    - System: ${systemCount}`)
  console.log(`    - Optional: ${optionalCount}`)
  console.log(`    - Experimental: ${experimentalCount}`)

  const categories = new Map<string, number>()
  FEATURES_REGISTRY.forEach(f => {
    categories.set(f.category, (categories.get(f.category) || 0) + 1)
  })

  console.log("\n  By category:")
  categories.forEach((count, category) => {
    console.log(`    - ${category}: ${count}`)
  })

  console.log("\n  Optional features catalog:")
  getOptionalFeaturesCatalog().forEach(f => {
    console.log(`    - ${f.slug} (${f.name}) v${f.version}`)
  })
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🔄 Syncing features from features.config.ts...\n")

  try {
    validateFeatures()
    syncDefaultMenuItems()
    syncOptionalFeaturesCatalog()
    generateReport()

    console.log("\n✨ Feature sync completed successfully!\n")
    console.log("Next steps:")
    console.log("  1. Review generated files:")
    console.log("     - convex/menu/store/menu_manifest_data.ts")
    console.log("     - convex/menu/store/optional_features_catalog.ts")
    console.log("  2. Run 'pnpm run validate:all' to ensure schemas are valid")
    console.log("  3. Commit the changes\n")
  } catch (error) {
    console.error("\n❌ Error syncing features:")
    console.error(error)
    process.exit(1)
  }
}

main()
