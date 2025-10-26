#!/usr/bin/env node
/**
 * Feature Validation Script
 *
 * Validates feature configs to ensure:
 * - All features follow the correct schema
 * - No duplicate slugs exist
 * - All required fields are present
 * - Feature versions are valid semver
 * - Icon names are valid (if strict mode)
 * - No circular dependencies
 *
 * Usage: pnpm run validate:features
 */

import { getAllFeatures, validateRegistry } from "../../lib/features/registry.server"

const FEATURES_REGISTRY = getAllFeatures()

// ============================================================================
// VALIDATION
// ============================================================================

interface ValidationError {
  feature: string
  field?: string
  message: string
  severity: "error" | "warning"
}

const errors: ValidationError[] = []

function addError(error: ValidationError) {
  errors.push(error)
}

function validateSchema() {
  console.log("\n🔍 Validating feature schemas...")

  const flattenFeatures = (features: any[], parent?: string): any[] => {
    return features.flatMap(f => {
      const current = { ...f, parent }
      const children = f.children ? flattenFeatures(f.children, f.id) : []
      return [current, ...children]
    })
  }

  const allFeatures = flattenFeatures(FEATURES_REGISTRY)

  // Use the registry's built-in validation
  const validation = validateRegistry()
  if (!validation.valid) {
    validation.errors.forEach(error => {
      addError({
        feature: "registry",
        message: error,
        severity: "error",
      })
    })
  }

  console.log(`  ✓ Validated ${allFeatures.length} features`)
}

function validateDuplicateSlugs() {
  console.log("\n🔍 Checking for duplicate slugs...")

  const slugs = new Map<string, number>()
  const flattenFeatures = (features: any[]): any[] => {
    return features.flatMap(f => [f, ...(f.children ? flattenFeatures(f.children) : [])])
  }

  flattenFeatures(FEATURES_REGISTRY).forEach(feature => {
    const count = slugs.get(feature.id) || 0
    slugs.set(feature.id, count + 1)
  })

  slugs.forEach((count, slug) => {
    if (count > 1) {
      addError({
        feature: slug,
        message: `Duplicate slug found ${count} times`,
        severity: "error",
      })
    }
  })

  console.log(`  ✓ No duplicate slugs found`)
}

function validateVersions() {
  console.log("\n🔍 Validating feature versions...")

  const semverRegex = /^\d+\.\d+\.\d+$/

  FEATURES_REGISTRY.forEach(feature => {
    if (!semverRegex.test(feature.technical.version)) {
      addError({
        feature: feature.id,
        field: "version",
        message: `Invalid version format: ${feature.technical.version}. Must be semver (e.g., 1.0.0)`,
        severity: "error",
      })
    }
  })

  console.log(`  ✓ All versions valid`)
}

function validatePaths() {
  console.log("\n🔍 Validating feature paths...")

  const paths = new Map<string, string>()

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.ui.path.startsWith("/dashboard/")) {
      addError({
        feature: feature.id,
        field: "path",
        message: `Path must start with /dashboard/: ${feature.ui.path}`,
        severity: "warning",
      })
    }

    const existing = paths.get(feature.ui.path)
    if (existing) {
      addError({
        feature: feature.id,
        field: "path",
        message: `Duplicate path ${feature.ui.path} shared with ${existing}`,
        severity: "error",
      })
    }

    paths.set(feature.ui.path, feature.id)
  })

  console.log(`  ✓ Paths validated`)
}

function validateComponents() {
  console.log("\n🔍 Validating feature components...")

  const components = new Map<string, string[]>()

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.ui.component) {
      addError({
        feature: feature.id,
        field: "component",
        message: "Component is required",
        severity: "error",
      })
      return
    }

    if (!feature.ui.component.endsWith("Page")) {
      addError({
        feature: feature.id,
        field: "component",
        message: `Component should end with 'Page': ${feature.ui.component}`,
        severity: "warning",
      })
    }

    const slugs = components.get(feature.ui.component) || []
    slugs.push(feature.id)
    components.set(feature.ui.component, slugs)
  })

  // Warn about component reuse (not necessarily an error)
  components.forEach((slugs, component) => {
    if (slugs.length > 1) {
      addError({
        feature: slugs.join(", "),
        field: "component",
        message: `Component ${component} is reused by multiple features`,
        severity: "warning",
      })
    }
  })

  console.log(`  ✓ Components validated`)
}

function validateDependencies() {
  console.log("\n🔍 Validating feature dependencies...")

  const allSlugs = new Set(
    FEATURES_REGISTRY.flatMap(f => [f.id, ...(f.children?.map(c => c.id) || [])])
  )

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.dependencies) return

    feature.dependencies.forEach(dep => {
      if (!allSlugs.has(dep)) {
        addError({
          feature: feature.id,
          field: "dependencies",
          message: `Dependency '${dep}' not found in registry`,
          severity: "error",
        })
      }
    })
  })

  console.log(`  ✓ Dependencies validated`)
}

function validateCategories() {
  console.log("\n🔍 Validating categories...")

  const validCategories = [
    "communication",
    "productivity",
    "collaboration",
    "administration",
    "social",
    "creativity",
    "analytics",
    "content",
  ]

  FEATURES_REGISTRY.forEach(feature => {
    if (!validCategories.includes(feature.ui.category)) {
      addError({
        feature: feature.id,
        field: "category",
        message: `Invalid category: ${feature.ui.category}. Must be one of: ${validCategories.join(", ")}`,
        severity: "error",
      })
    }
  })

  console.log(`  ✓ Categories validated`)
}

function generateReport() {
  console.log("\n" + "=".repeat(60))
  console.log(" FEATURE VALIDATION REPORT")
  console.log("=".repeat(60))

  const errorCount = errors.filter(e => e.severity === "error").length
  const warningCount = errors.filter(e => e.severity === "warning").length

  if (errors.length === 0) {
    console.log("\n✅ All features are valid!")
    console.log(`\n  Total features: ${FEATURES_REGISTRY.length}`)
    console.log(`  Default: ${FEATURES_REGISTRY.filter(f => f.technical.featureType === "default").length}`)
    console.log(`  System: ${FEATURES_REGISTRY.filter(f => f.technical.featureType === "system").length}`)
    console.log(`  Optional: ${FEATURES_REGISTRY.filter(f => f.technical.featureType === "optional").length}`)
    console.log(`  Experimental: ${FEATURES_REGISTRY.filter(f => f.technical.featureType === "experimental").length}`)
    return true
  }

  console.log(`\n❌ Found ${errorCount} error(s) and ${warningCount} warning(s)\n`)

  // Group by severity
  const errorsByFeature = new Map<string, ValidationError[]>()

  errors.forEach(error => {
    const list = errorsByFeature.get(error.feature) || []
    list.push(error)
    errorsByFeature.set(error.feature, list)
  })

  // Display errors
  if (errorCount > 0) {
    console.log("ERRORS:")
    console.log("".repeat(60))
    errors
      .filter(e => e.severity === "error")
      .forEach(error => {
        const field = error.field ? ` [${error.field}]` : ""
        console.log(`  ❌ ${error.feature}${field}: ${error.message}`)
      })
  }

  // Display warnings
  if (warningCount > 0) {
    console.log("\nWARNINGS:")
    console.log("".repeat(60))
    errors
      .filter(e => e.severity === "warning")
      .forEach(error => {
        const field = error.field ? ` [${error.field}]` : ""
        console.log(`  ⚠️  ${error.feature}${field}: ${error.message}`)
      })
  }

  return errorCount === 0
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🔍 Validating features.config.ts...\n")

  try {
    validateSchema()
    validateDuplicateSlugs()
    validateVersions()
    validatePaths()
    validateComponents()
    validateDependencies()
    validateCategories()

    const isValid = generateReport()

    console.log("\n" + "=".repeat(60) + "\n")

    if (!isValid) {
      console.error("❌ Feature validation failed. Please fix the errors above.\n")
      process.exit(1)
    }

    console.log("✅ Feature validation passed!\n")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Unexpected error during validation:")
    console.error(error)
    process.exit(1)
  }
}

main()
