#!/usr/bin/env node
/**
 * Feature Scaffolding CLI
 *
 * Usage: pnpm run scaffold:feature <slug> [options]
 *
 * This script automatically generates:
 * - Frontend feature structure (UI components, hooks, types)
 * - Convex handlers (queries, mutations, actions)
 * - Test files (unit and integration tests)
 * - Updates features.config.ts with the new feature
 * - Optionally updates menu manifest
 *
 * Example:
 *   pnpm run scaffold:feature reports --type optional --category analytics
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs"
import { join } from "path"

// ============================================================================
// CLI ARGUMENTS
// ============================================================================

interface ScaffoldOptions {
  slug: string
  name?: string
  description?: string
  featureType: "default" | "optional" | "experimental"
  category:
    | "communication"
    | "productivity"
    | "collaboration"
    | "administration"
    | "social"
    | "creativity"
    | "analytics"
  icon?: string
  hasUI: boolean
  hasConvex: boolean
  hasTests: boolean
  requiresPermission?: string
}

function parseArgs(): ScaffoldOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === "-help" || args[0] === "h") {
    console.log(`
Feature Scaffolding CLI

Usage: pnpm run scaffold:feature <slug> [options]

Arguments:
  slug                Feature slug (e.g., reports, calendar)

Options:
  --name              Feature display name (default: capitalized slug)
  --description       Feature description
  --type              Feature type: default|optional|experimental (default: optional)
  --category          Category: communication|productivity|collaboration|administration|social|creativity|analytics
  --icon              Lucide icon name (default: Box)
  --no-ui             Skip frontend UI generation
  --no-convex         Skip Convex handlers generation
  --no-tests          Skip test files generation
  --permission        Required permission (e.g., MANAGE_REPORTS)

Examples:
  pnpm run scaffold:feature reports --type optional --category analytics
  pnpm run scaffold:feature calendar --type optional --category productivity --icon Calendar
  pnpm run scaffold:feature admin-panel --type default --category administration --permission MANAGE_ADMIN
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("-")) {
    console.error("Error: Feature slug is required")
    process.exit(1)
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error("Error: Slug must contain only lowercase letters, numbers, and hyphens")
    process.exit(1)
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag)
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined
  }

  const hasFlag = (flag: string): boolean => args.includes(flag)

  const name = getArg("-name") || slug.split("").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  const description = getArg("-description") || `${name} feature`
  const featureType = (getArg("-type") as ScaffoldOptions["featureType"]) || "optional"
  const category = (getArg("-category") as ScaffoldOptions["category"]) || "productivity"
  const icon = getArg("-icon") || "Box"
  const requiresPermission = getArg("-permission")

  const hasUI = !hasFlag("-no-ui")
  const hasConvex = !hasFlag("-no-convex")
  const hasTests = !hasFlag("-no-tests")

  // Validate category
  const validCategories = [
    "communication",
    "productivity",
    "collaboration",
    "administration",
    "social",
    "creativity",
    "analytics",
  ]
  if (!validCategories.includes(category)) {
    console.error(`Error: Invalid category. Must be one of: ${validCategories.join(", ")}`)
    process.exit(1)
  }

  // Validate feature type
  const validTypes = ["default", "optional", "experimental"]
  if (!validTypes.includes(featureType)) {
    console.error(`Error: Invalid type. Must be one of: ${validTypes.join(", ")}`)
    process.exit(1)
  }

  return {
    slug,
    name,
    description,
    featureType,
    category,
    icon,
    hasUI,
    hasConvex,
    hasTests,
    requiresPermission,
  }
}

// ============================================================================
// TEMPLATES
// ============================================================================

function generateFrontendIndex(slug: string, name: string): string {
  const componentName = slug
    .split("")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `/**
 * ${name} Feature
 *
 * Main entry point for the ${name.toLowerCase()} feature.
 */

export { default as ${componentName}Page } from "./views/${componentName}Page"
export * from "./hooks/use${componentName}"
export * from "./types"
`
}

function generateFrontendPage(slug: string, name: string): string {
  const componentName = slug
    .split("")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `"use client"

import React from "react"
import { use${componentName} } from "../hooks/use${componentName}"

/**
 * ${name} Page Component
 */
export default function ${componentName}Page() {
  const { isLoading, error } = use${componentName}()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading ${name.toLowerCase()}...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">${name}</h1>
        <p className="text-muted-foreground">
          Welcome to the ${name.toLowerCase()} feature.
        </p>
      </div>

      <div className="flex-1">
        {/* Add your UI components here */}
        <div className="border rounded-lg p-4">
          <p>Your ${name.toLowerCase()} content goes here.</p>
        </div>
      </div>
    </div>
  )
}
`
}

function generateFrontendHook(slug: string, name: string): string {
  const componentName = slug
    .split("")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

/**
 * ${name} Hook
 *
 * Provides data and actions for the ${name.toLowerCase()} feature.
 */
export function use${componentName}() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // TODO: Replace with actual Convex queries
  // const data = useQuery(api.features.${slug}.queries.list)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return {
    isLoading,
    error,
    // Add your data and mutations here
  }
}
`
}

function generateFrontendTypes(slug: string, name: string): string {
  return `/**
 * ${name} Types
 */

export interface ${name.replace(/\s+/g, "")}Item {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ${name.replace(/\s+/g, "")}Filter {
  query?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}
`
}

function generateConvexQueries(slug: string, name: string): string {
  return `import { v } from "convex/values"
import { query } from "../../../_generated/server"
import { requireActiveMembership } from "../../../auth/helpers"

/**
 * ${name} Queries
 */

// List all items
export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Require active membership
    await requireActiveMembership(ctx, args.workspaceId)

    // TODO: Implement your query logic
    const items = await ctx.db
      .query("${slug}")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect()

    return items
  },
})

// Get single item
export const get = query({
  args: {
    id: v.id("${slug}"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) return null

    // Verify access
    await requireActiveMembership(ctx, item.workspaceId)

    return item
  },
})
`
}

function generateConvexMutations(slug: string, name: string, requiresPermission?: string): string {
  const permissionCheck = requiresPermission
    ? `await requirePermission(ctx, args.workspaceId, PERMS.${requiresPermission})`
    : `await requireActiveMembership(ctx, args.workspaceId)`

  return `import { v } from "convex/values"
import { mutation } from "../../../_generated/server"
import { requireActiveMembership, requirePermission } from "../../../auth/helpers"
import { PERMS } from "../../../workspace/permissions"

/**
 * ${name} Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Require permission
    ${permissionCheck}

    const itemId = await ctx.db.insert("${slug}", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // TODO: Add audit log
    // await logAudit(ctx, {
    //   action: "${slug}:create",
    //   workspaceId: args.workspaceId,
    //   targetId: itemId,
    // })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("${slug}"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    ${permissionCheck.replace("args.workspaceId", "item.workspaceId")}

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("${slug}"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    ${permissionCheck.replace("args.workspaceId", "item.workspaceId")}

    await ctx.db.delete(args.id)

    return args.id
  },
})
`
}

function generateConvexIndex(slug: string): string {
  return `/**
 * ${slug.charAt(0).toUpperCase() + slug.slice(1)} Feature Handlers
 */

export * as queries from "./queries"
export * as mutations from "./mutations"
`
}

function generateUnitTest(slug: string, name: string): string {
  const componentName = slug
    .split("")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `import { describe, it, expect } from "vitest"

/**
 * ${name} Unit Tests
 */

describe("${componentName}", () => {
  it("should be defined", () => {
    expect(true).toBe(true)
  })

  // TODO: Add more unit tests
})
`
}

function generateIntegrationTest(slug: string, name: string): string {
  return `import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

/**
 * ${name} Integration Tests
 */

describe("${slug} Integration", () => {
  let t: any

  beforeEach(async () => {
    t = convexTest(schema)
  })

  afterEach(async () => {
    await t.finishAllScheduledFunctions()
  })

  it("should create a new item", async () => {
    // TODO: Implement integration test
    expect(true).toBe(true)
  })

  // TODO: Add more integration tests
})
`
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

function scaffoldFeature(options: ScaffoldOptions) {
  const { slug, name, hasUI, hasConvex, hasTests } = options

  console.log(`\n🚀 Scaffolding feature: ${name} (${slug})\n`)

  const rootDir = process.cwd()

  // 1. Create frontend structure
  if (hasUI) {
    console.log("📁 Creating frontend structure...")
    const featurePath = join(rootDir, "frontend", "features", slug)

    ensureDir(join(featurePath, "views"))
    ensureDir(join(featurePath, "hooks"))
    ensureDir(join(featurePath, "types"))
    ensureDir(join(featurePath, "components"))

    writeFileSync(join(featurePath, "index.ts"), generateFrontendIndex(slug, name!))
    writeFileSync(
      join(featurePath, "views", `${slug.split("").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}Page.tsx`),
      generateFrontendPage(slug, name!)
    )
    writeFileSync(
      join(featurePath, "hooks", `use${slug.split("").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}.ts`),
      generateFrontendHook(slug, name!)
    )
    writeFileSync(join(featurePath, "types", "index.ts"), generateFrontendTypes(slug, name!))

    console.log(`  ✓ Created ${featurePath}`)
  }

  // 2. Create Convex handlers
  if (hasConvex) {
    console.log("\n📁 Creating Convex handlers...")
    const convexPath = join(rootDir, "convex", "features", slug)

    ensureDir(convexPath)

    writeFileSync(join(convexPath, "queries.ts"), generateConvexQueries(slug, name!))
    writeFileSync(join(convexPath, "mutations.ts"), generateConvexMutations(slug, name!, options.requiresPermission))
    writeFileSync(join(convexPath, "index.ts"), generateConvexIndex(slug))

    console.log(`  ✓ Created ${convexPath}`)
  }

  // 3. Create tests
  if (hasTests) {
    console.log("\n📁 Creating test files...")
    const testsPath = join(rootDir, "tests", "features", slug)

    ensureDir(testsPath)

    writeFileSync(join(testsPath, `${slug}.test.ts`), generateUnitTest(slug, name!))
    writeFileSync(join(testsPath, `${slug}.integration.test.ts`), generateIntegrationTest(slug, name!))

    console.log(`  ✓ Created ${testsPath}`)
  }

  // 4. Update features.config.ts
  console.log("\n📝 Updating features.config.ts...")
  updateFeaturesConfig(options)

  // 5. Summary
  console.log("\n✨ Feature scaffolded successfully!\n")
  console.log("Next steps:")
  console.log(`  1. Review generated files in frontend/features/${slug}`)
  if (hasConvex) console.log(`  2. Implement Convex handlers in convex/features/${slug}`)
  if (hasTests) console.log(`  3. Write tests in tests/features/${slug}`)
  console.log(`  4. Run 'pnpm run sync:features' to update menu manifest`)
  console.log(`  5. Run 'pnpm run test' to verify tests pass`)
  console.log("")
}

function updateFeaturesConfig(options: ScaffoldOptions) {
  const configPath = join(process.cwd(), "features.config.ts")
  const content = readFileSync(configPath, "utf-8")

  // Find the FEATURES_REGISTRY array
  const registryMatch = content.match(/export const FEATURES_REGISTRY: FeatureMetadata\[] = \[/)
  if (!registryMatch) {
    console.error("  ⚠️  Could not find FEATURES_REGISTRY in features.config.ts")
    console.log("  📝 Please manually add the feature to features.config.ts")
    return
  }

  const componentName = options.slug
    .split("")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  const newFeature = `
  {
    slug: "${options.slug}",
    name: "${options.name}",
    description: "${options.description}",
    featureType: "${options.featureType}",
    category: "${options.category}",
    icon: "${options.icon}",
    path: "/dashboard/${options.slug}",
    component: "${componentName}Page",
    order: 100,
    type: "route",
    version: "1.0.0",
    hasUI: ${options.hasUI},
    hasConvex: ${options.hasConvex},
    hasTests: ${options.hasTests},${options.requiresPermission ? `\n    requiresPermission: "${options.requiresPermission}",` : ""}
  },`

  // Find the end of FEATURES_REGISTRY array
  // Look for the last closing bracket before the helper functions
  const registryEndMatch = content.match(/]\s*\n\s*\/\/ =+\s*\n\s*\/\/ HELPER FUNCTIONS/)

  if (!registryEndMatch) {
    console.error("  ⚠️  Could not find end of FEATURES_REGISTRY")
    console.log("  📝 Please manually add the feature to features.config.ts:")
    console.log(newFeature)
    return
  }

  const insertPosition = registryEndMatch.index!
  const newContent = content.slice(0, insertPosition) + newFeature + "\n" + content.slice(insertPosition)

  writeFileSync(configPath, newContent)
  console.log(`  ✓ Added feature to features.config.ts`)
}

// ============================================================================
// RUN
// ============================================================================

const options = parseArgs()
scaffoldFeature(options)
