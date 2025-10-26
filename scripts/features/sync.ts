#!/usr/bin/env node
/**
 * Feature Sync Script
 *
 * Synchronizes feature configs with:
 * - convex/menu/store/menu_manifest_data.ts (DEFAULT_MENU_ITEMS)
 * - Menu Store catalog (optional features)
 *
 * Usage: pnpm run sync:features
 *
 * This script ensures that:
 * 1. All default features from auto-discovered configs are in DEFAULT_MENU_ITEMS
 * 2. All optional features are available in the catalog
 * 3. No divergence between config and manifest
 */

import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { getAllFeatures, getFeatureSlug, getFeaturesByType } from "../../lib/features/registry.server"

const rootDir = process.cwd()

// Convert registry features to menu item format
function featureToMenuItem(feature: any): any {
  return {
    name: feature.name,
    slug: feature.id,
    type: 'route',
    icon: feature.ui.icon,
    path: feature.ui.path,
    component: feature.ui.component,
    order: feature.ui.order,
    metadata: {
      description: feature.description,
      version: feature.technical.version,
      category: feature.ui.category,
      tags: feature.tags,
      featureType: feature.technical.featureType,
      originalFeatureType: feature.technical.featureType,
      requiresPermission: feature.permissions?.[0],
      originalRequiresPermission: feature.permissions?.[0],
    },
    requiresPermission: feature.permissions?.[0],
    children: feature.children?.map(featureToMenuItem),
  }
}

function getAllDefaultMenuItems() {
  const defaultFeatures = getAllFeatures().filter(
    f => f.technical.featureType === 'default' || f.technical.featureType === 'system'
  )
  return defaultFeatures.map(featureToMenuItem)
}

function getOptionalFeaturesCatalog() {
  return getFeaturesByType('optional').map(f => ({
    slug: f.id,
    name: f.name,
    description: f.description,
    icon: f.ui.icon,
    version: f.technical.version,
    category: f.ui.category,
    tags: f.tags,
    requiresPermission: f.permissions?.[0],
    originalRequiresPermission: f.permissions?.[0],
    status: f.status.state,
    isReady: f.status.isReady,
    expectedRelease: f.status.expectedRelease,
    featureType: f.technical.featureType,
  }))
}

const FEATURES_REGISTRY = getAllFeatures()

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
// AUTO-GENERATED - DO NOT EDIT MANUALLY.
// Source: frontend/features/*/config.ts (auto-discovered)
// Update via: pnpm run sync:features

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

  const header = [
    "// Optional Features Catalog",
    "//",
    "// Available features that can be installed from the Menu Store.",
    "//",
    "// AUTO-GENERATED - DO NOT EDIT MANUALLY.",
    "// Source: frontend/features/<feature>/config.ts (auto-discovered)",
    "// Update via: pnpm run sync:features",
    "",
  ].join("\n")

  const content = `${header}export const OPTIONAL_FEATURES_CATALOG = ${JSON.stringify(catalog, null, 2)}
`

  writeFileSync(catalogPath, content)
  console.log(`  ✓ Synced ${catalog.length} optional features to ${catalogPath}`)
}

// ============================================================================
// VALIDATE FEATURES
// ============================================================================

interface ValidationError {
  featureId: string
  configPath: string
  field?: string
  error: string
}

function getConfigPath(featureId: string): string {
  const slug = getFeatureSlug(featureId) ?? featureId
  return `frontend/features/${slug}/config.ts`
}

function getComponentCandidatePaths(feature: any) {
  const component = feature?.ui?.component
  if (!component) {
    return []
  }

  const slugFromConfig = getFeatureSlug(feature.id)
  const candidateSlugs = slugFromConfig && slugFromConfig !== feature.id
    ? [slugFromConfig, feature.id]
    : [feature.id]

  const candidates: { displayPath: string; absolutePath: string }[] = []

  for (const slug of candidateSlugs) {
    candidates.push({
      displayPath: `frontend/features/${slug}/views/${component}.tsx`,
      absolutePath: join(rootDir, "frontend", "features", slug, "views", `${component}.tsx`),
    })
    candidates.push({
      displayPath: `frontend/features/${slug}/page.tsx`,
      absolutePath: join(rootDir, "frontend", "features", slug, "page.tsx"),
    })
    candidates.push({
      displayPath: `frontend/features/${slug}/index.ts`,
      absolutePath: join(rootDir, "frontend", "features", slug, "index.ts"),
    })
    candidates.push({
      displayPath: `frontend/features/${slug}/index.tsx`,
      absolutePath: join(rootDir, "frontend", "features", slug, "index.tsx"),
    })
  }

  candidates.push({
    displayPath: `frontend/views/static/${feature.id}/page.tsx`,
    absolutePath: join(rootDir, "frontend", "views", "static", feature.id, "page.tsx"),
  })
  candidates.push({
    displayPath: `frontend/views/dynamic/${feature.id}/page.tsx`,
    absolutePath: join(rootDir, "frontend", "views", "dynamic", feature.id, "page.tsx"),
  })

  return candidates
}

function hasComponentImplementation(feature: any) {
  const candidates = getComponentCandidatePaths(feature)
  const match = candidates.find(candidate => existsSync(candidate.absolutePath))
  return {
    found: Boolean(match),
    resolvedPath: match?.displayPath,
    candidates,
  }
}

function validateFeatures() {
  console.log("\n✅ Validating features...")

  const errors: ValidationError[] = []
  const slugs = new Set<string>()

  const flattenFeatures = (features: any[]): any[] => {
    return features.flatMap(f => [f, ...(f.children ? flattenFeatures(f.children) : [])])
  }

  // Check each feature
  flattenFeatures(FEATURES_REGISTRY).forEach(feature => {
    const configPath = getConfigPath(feature.id)

    // Check for duplicate IDs
    if (slugs.has(feature.id)) {
      errors.push({
        featureId: feature.id,
        configPath,
        field: 'id',
        error: `Duplicate feature ID found: "${feature.id}"`
      })
    }
    slugs.add(feature.id)

    // Validate required fields with proper path access
    if (!feature.name) {
      errors.push({
        featureId: feature.id || 'unknown',
        configPath,
        field: 'name',
        error: 'Missing required field: name'
      })
    }

    if (!feature.ui || !feature.ui.component) {
      errors.push({
        featureId: feature.id || 'unknown',
        configPath,
        field: 'ui.component',
        error: 'Missing required field: ui.component'
      })
    }

    if (!feature.ui || !feature.ui.path) {
      errors.push({
        featureId: feature.id || 'unknown',
        configPath,
        field: 'ui.path',
        error: 'Missing required field: ui.path'
      })
    }

    if (!feature.ui || !feature.ui.icon) {
      errors.push({
        featureId: feature.id || 'unknown',
        configPath,
        field: 'ui.icon',
        error: 'Missing required field: ui.icon'
      })
    }

    if (!feature.technical || !feature.technical.featureType) {
      errors.push({
        featureId: feature.id || 'unknown',
        configPath,
        field: 'technical.featureType',
        error: 'Missing required field: technical.featureType'
      })
    }

    if (!feature.technical || feature.technical.version === undefined) {
      errors.push({
        featureId: feature.id || 'unknown',
        configPath,
        field: 'technical.version',
        error: 'Missing required field: technical.version'
      })
    }

    const expectsUI = feature.technical?.hasUI !== false
    if (expectsUI && feature.ui?.component) {
      const componentCheck = hasComponentImplementation(feature)
      if (!componentCheck.found) {
        const searched = componentCheck.candidates.map(c => c.displayPath).join(', ')
        errors.push({
          featureId: feature.id || 'unknown',
          configPath,
          field: 'ui.component',
          error: `Component implementation not found. Checked: ${searched}`
        })
      }
    }
  })

  if (errors.length > 0) {
    console.error("\n❌ Validation errors:\n")

    // Group errors by feature
    const errorsByFeature = errors.reduce((acc, err) => {
      if (!acc[err.featureId]) acc[err.featureId] = []
      acc[err.featureId].push(err)
      return acc
    }, {} as Record<string, ValidationError[]>)

    Object.entries(errorsByFeature).forEach(([featureId, featureErrors]) => {
      console.error(`📁 Feature: ${featureId}`)
      console.error(`   File: ${featureErrors[0].configPath}`)
      console.error(`   Errors:`)
      featureErrors.forEach(err => {
        console.error(`     - ${err.error}${err.field ? ` (field: ${err.field})` : ''}`)
      })
      console.error('')
    })

    console.error(`Total errors: ${errors.length}`)
    console.error(`\n💡 Fix these errors in the config.ts files above, then run sync again.\n`)
    process.exit(1)
  }

  console.log(`  ✓ Validated ${FEATURES_REGISTRY.length} features`)
}

// ============================================================================
// GENERATE FEATURE REPORT
// ============================================================================

function generateReport() {
  console.log("\n Feature Report:")
  console.log("==================")

  const defaultCount = FEATURES_REGISTRY.filter(f => f.technical.featureType === "default").length
  const systemCount = FEATURES_REGISTRY.filter(f => f.technical.featureType === "system").length
  const optionalCount = FEATURES_REGISTRY.filter(f => f.technical.featureType === "optional").length
  const experimentalCount = FEATURES_REGISTRY.filter(
    f => f.technical.featureType === "experimental"
  ).length

  console.log(`  Total features: ${FEATURES_REGISTRY.length}`)
  console.log(`    - Default: ${defaultCount}`)
  console.log(`    - System: ${systemCount}`)
  console.log(`    - Optional: ${optionalCount}`)
  console.log(`    - Experimental: ${experimentalCount}`)

  const categories = new Map<string, number>()
  FEATURES_REGISTRY.forEach(f => {
    const category = f.ui.category
    categories.set(category, (categories.get(category) || 0) + 1)
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
  console.log("🔄 Syncing features from auto-discovered configs...\n")

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
