#!/usr/bin/env node
/**
 * Feature Naming Validation
 *
 * Validates naming and folder conventions between:
 * - feature.id (canonical id)
 * - frontend/features/<slug>
 * - convex/features/<convexSlug>
 *
 * Usage: pnpm run validate:feature-naming
 */

import { existsSync } from "fs"
import { join } from "path"
import { getAllFeatures, getFeatureMeta } from "../../frontend/shared/lib/features/registry.server"

interface NamingIssue {
  severity: "error" | "warning"
  featureId: string
  message: string
}

interface FlattenedFeature {
  id: string
  technical?: {
    hasConvex?: boolean
  }
  parent?: string
  children?: any[]
}

const issues: NamingIssue[] = []

function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

function toConvexSlug(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, ch: string) => ch.toUpperCase())
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function flattenFeatures(features: any[], parent?: string): FlattenedFeature[] {
  return features.flatMap((feature) => {
    const current: FlattenedFeature = {
      id: feature.id,
      technical: feature.technical,
      parent,
      children: feature.children,
    }
    const children = feature.children ? flattenFeatures(feature.children, feature.id) : []
    return [current, ...children]
  })
}

function addIssue(issue: NamingIssue): void {
  issues.push(issue)
}

function validate(): void {
  const rootDir = process.cwd()
  const features = flattenFeatures(getAllFeatures())

  for (const feature of features) {
    const featureId = feature.id

    if (!isKebabCase(featureId)) {
      addIssue({
        severity: "error",
        featureId,
        message: `feature.id must be kebab-case, got "${featureId}"`,
      })
    }

    // Child features inherit parent folder structure and are not mapped 1:1 to folders.
    if (feature.parent) {
      continue
    }

    const meta = getFeatureMeta(featureId)
    const frontendSlug = meta?.slug ?? featureId

    if (!isKebabCase(frontendSlug)) {
      addIssue({
        severity: "warning",
        featureId,
        message: `frontend folder "${frontendSlug}" is not kebab-case`,
      })
    }

    if (frontendSlug !== featureId) {
      addIssue({
        severity: "warning",
        featureId,
        message: `frontend folder "${frontendSlug}" differs from feature.id "${featureId}" (legacy mapping)`,
      })
    }

    const hasConvex = Boolean(feature?.technical?.hasConvex)
    if (!hasConvex) {
      continue
    }

    const expectedConvexSlug = toConvexSlug(featureId)
    const convexCandidates = unique([
      expectedConvexSlug,
      featureId,
      featureId.replace(/-/g, "_"),
      toConvexSlug(frontendSlug),
      frontendSlug,
    ])

    const existingConvexSlug = convexCandidates.find((candidate) =>
      existsSync(join(rootDir, "convex", "features", candidate))
    )

    if (!existingConvexSlug) {
      addIssue({
        severity: "error",
        featureId,
        message: `missing convex folder (checked: ${convexCandidates.join(", ")})`,
      })
      continue
    }

    if (existingConvexSlug !== expectedConvexSlug) {
      addIssue({
        severity: "warning",
        featureId,
        message: `convex folder uses "${existingConvexSlug}", expected "${expectedConvexSlug}"`,
      })
    }
  }
}

function printReport(): void {
  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warning")

  console.log("Feature naming validation")
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)

  if (errors.length > 0) {
    console.log("\nErrors:")
    for (const issue of errors) {
      console.log(`- [${issue.featureId}] ${issue.message}`)
    }
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:")
    for (const issue of warnings) {
      console.log(`- [${issue.featureId}] ${issue.message}`)
    }
  }

  if (issues.length === 0) {
    console.log("\nAll naming conventions are compliant.")
  }
}

function main(): void {
  try {
    validate()
    printReport()

    if (issues.some((issue) => issue.severity === "error")) {
      process.exit(1)
    }

    process.exit(0)
  } catch (error) {
    console.error("Unexpected error while validating feature naming")
    console.error(error)
    process.exit(1)
  }
}

main()
