#!/usr/bin/env node
/**
 * Feature Creation Script (CRUD - Create)
 *
 * Creates a new feature with:
 * - Frontend structure (UI components, hooks, types)
 * - Feature config.ts (auto-discovered, NO hardcoding!)
 * - Convex handlers (queries, mutations, actions)
 * - Test files (unit and integration)
 *
 * Usage: pnpm run create:feature <slug> [options]
 *
 * Example:
 *   pnpm run create:feature analytics --type optional --category analytics --icon BarChart
 */

import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

// ============================================================================
// TYPES
// ============================================================================

interface CreateFeatureOptions {
  slug: string
  name?: string
  description?: string
  featureType: "default" | "optional" | "experimental" | "system"
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
  permissions?: string[]
  tags?: string[]
  order?: number
}

// ============================================================================
// CLI ARGUMENTS
// ============================================================================

function parseArgs(): CreateFeatureOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Feature Creation CLI

Usage: pnpm run create:feature <slug> [options]

Arguments:
  slug                Feature slug (kebab-case, e.g., my-analytics)

Options:
  --name              Feature display name (default: Title Case slug)
  --description       Feature description
  --type              Feature type: default|optional|experimental|system (default: optional)
  --category          Category (required): communication|productivity|collaboration|administration|social|creativity|analytics
  --icon              Lucide icon name (default: Box)
  --order             Menu order number (default: 100)
  --permissions       Comma-separated permissions (e.g., VIEW_ANALYTICS,MANAGE_ANALYTICS)
  --tags              Comma-separated tags (e.g., analytics,reports,data)
  --no-ui             Skip frontend UI generation
  --no-convex         Skip Convex handlers generation
  --no-tests          Skip test files generation

Examples:
  pnpm run create:feature analytics --type optional --category analytics --icon BarChart
  pnpm run create:feature admin-panel --type default --category administration --permissions MANAGE_ADMIN
  pnpm run create:feature beta-feature --type experimental --category productivity
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("--")) {
    console.error("❌ Error: Feature slug is required")
    console.error("   Usage: pnpm run create:feature <slug> [options]")
    process.exit(1)
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error("❌ Error: Slug must contain only lowercase letters, numbers, and hyphens")
    console.error(`   Got: "${slug}"`)
    process.exit(1)
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag)
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined
  }

  const hasFlag = (flag: string): boolean => args.includes(flag)

  // Convert slug to Title Case for default name
  const slugToTitle = (s: string) =>
    s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

  const name = getArg("--name") || slugToTitle(slug)
  const description = getArg("--description") || `${name} feature`
  const featureType = (getArg("--type") as CreateFeatureOptions["featureType"]) || "optional"
  const categoryArg = getArg("--category")
  const icon = getArg("--icon") || "Box"
  const orderArg = getArg("--order")
  const order = orderArg ? parseInt(orderArg) : 100
  const permissionsArg = getArg("--permissions")
  const permissions = permissionsArg ? permissionsArg.split(",").map((p) => p.trim()) : undefined
  const tagsArg = getArg("--tags")
  const tags = tagsArg ? tagsArg.split(",").map((t) => t.trim()) : undefined

  const hasUI = !hasFlag("--no-ui")
  const hasConvex = !hasFlag("--no-convex")
  const hasTests = !hasFlag("--no-tests")

  // Validate category (REQUIRED)
  const validCategories = [
    "communication",
    "productivity",
    "collaboration",
    "administration",
    "social",
    "creativity",
    "analytics",
  ]
  if (!categoryArg) {
    console.error("❌ Error: --category is required")
    console.error(`   Valid categories: ${validCategories.join(", ")}`)
    process.exit(1)
  }
  if (!validCategories.includes(categoryArg)) {
    console.error(`❌ Error: Invalid category "${categoryArg}"`)
    console.error(`   Valid categories: ${validCategories.join(", ")}`)
    process.exit(1)
  }

  // Validate feature type
  const validTypes = ["default", "optional", "experimental", "system"]
  if (!validTypes.includes(featureType)) {
    console.error(`❌ Error: Invalid type "${featureType}"`)
    console.error(`   Valid types: ${validTypes.join(", ")}`)
    process.exit(1)
  }

  return {
    slug,
    name,
    description,
    featureType,
    category: categoryArg as CreateFeatureOptions["category"],
    icon,
    hasUI,
    hasConvex,
    hasTests,
    permissions,
    tags,
    order,
  }
}

// ============================================================================
// TEMPLATES
// ============================================================================

function generateFeatureConfig(options: CreateFeatureOptions): string {
  const {
    slug,
    name,
    description,
    featureType,
    category,
    icon,
    order,
    permissions,
    tags,
    hasUI,
    hasConvex,
    hasTests,
  } = options

  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  const permissionsStr = permissions ? JSON.stringify(permissions, null, 4) : undefined
  const tagsStr = tags ? JSON.stringify(tags, null, 4) : JSON.stringify([slug, category], null, 4)

  return `import { defineFeature } from '@/lib/features/defineFeature'

/**
 * ${name} Feature Configuration
 *
 * This is the single source of truth for the ${slug} feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: '${slug}',
  name: '${name}',
  description: '${description}',

  // UI Config
  ui: {
    icon: '${icon}',                  // Lucide React icon name
    path: '/dashboard/${slug}',
    component: '${componentName}Page',
    category: '${category}',
    order: ${order},
  },

  // Technical Config
  technical: {
    featureType: '${featureType}',
    hasUI: ${hasUI},
    hasConvex: ${hasConvex},
    hasTests: ${hasTests},
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'development',              // development | beta | stable | deprecated
    isReady: false,                     // Set to true when ready for production
    expectedRelease: undefined,         // Optional: 'Q1 2025'
  },

  // Metadata
  tags: ${tagsStr},${permissions ? `\n\n  // Permissions (optional)\n  permissions: ${permissionsStr},` : ""}
})
`
}

function generateFrontendPage(slug: string, name: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `"use client"

import React from "react"
import { use${componentName} } from "../hooks/use${componentName}"

/**
 * ${name} Page Component
 */
export default function ${componentName}Page() {
  const { isLoading, error, data } = use${componentName}()

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
        <p className="text-muted-foreground mt-2">
          Welcome to ${name}
        </p>
      </div>

      <div className="flex-1">
        {/* TODO: Implement your feature UI here */}
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Start building your ${name.toLowerCase()} feature here!
          </p>
        </div>
      </div>
    </div>
  )
}
`
}

function generateHook(slug: string, name: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

/**
 * Hook for ${name} feature
 */
export function use${componentName}() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // TODO: Replace with your actual Convex query
  // const data = useQuery(api.features.${slug}.queries.get${componentName}, {})

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return {
    isLoading,
    error,
    data: null, // TODO: Return actual data from Convex query
  }
}
`
}

function generateTypes(slug: string): string {
  const typeName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `/**
 * Type definitions for ${slug} feature
 */

export interface ${typeName}Item {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ${typeName}Config {
  enabled: boolean
  settings?: Record<string, unknown>
}
`
}

function generateConvexQueries(slug: string): string {
  return `import { query } from "@/convex/_generated/server"
import { v } from "convex/values"
import { requireActiveMembership } from "../../../auth/helpers"

/**
 * Queries for ${slug} feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check workspace membership
    const { membership, role } = await requireActiveMembership(ctx, args.workspaceId)

    // TODO: Implement your query logic
    return {
      message: "Query successful",
      userId: membership.userDocId,
      role: role.name,
    }
  },
})
`
}

function generateConvexMutations(slug: string): string {
  return `import { mutation } from "@/convex/_generated/server"
import { v } from "convex/values"
import { requirePermission } from "../../../auth/helpers"
import { PERMS } from "../../../workspace/permissions"

/**
 * Mutations for ${slug} feature
 */

export const createItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check permission
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.DOCUMENTS_CREATE // TODO: Use appropriate permission
    )

    // TODO: Implement your mutation logic
    const itemId = await ctx.db.insert("documents", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdBy: membership.userDocId,
      createdAt: Date.now(),
    })

    // TODO: Add audit logging
    // await ctx.runMutation(internal.audit.logEvent, { ... })

    return itemId
  },
})
`
}

function generateTest(slug: string, name: string): string {
  return `import { describe, it, expect } from "vitest"

/**
 * Unit tests for ${name} feature
 */
describe("${name} Feature", () => {
  it("should initialize correctly", () => {
    expect(true).toBe(true)
  })

  // TODO: Add more unit tests for utilities, helpers, etc.
})
`
}

function generateIntegrationTest(slug: string, name: string): string {
  return `import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

/**
 * Integration tests for ${name} feature
 */
describe("${name} Integration", () => {
  let t: any

  beforeEach(async () => {
    t = convexTest(schema)
  })

  it("should enforce RBAC on queries", async () => {
    // TODO: Test permission checks
    expect(true).toBe(true)
  })

  it("should enforce RBAC on mutations", async () => {
    // TODO: Test permission checks
    expect(true).toBe(true)
  })

  // TODO: Add more integration tests for Convex handlers
})
`
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🚀 Feature Creation Script\n")

  const options = parseArgs()
  const { slug, name, hasUI, hasConvex, hasTests } = options

  const rootDir = process.cwd()
  const featureDir = join(rootDir, "frontend", "features", slug)

  // Check if feature already exists
  if (existsSync(featureDir)) {
    console.error(`❌ Error: Feature "${slug}" already exists at:`)
    console.error(`   ${featureDir}`)
    console.error(`\n💡 Tip: Use 'pnpm run edit:feature ${slug}' to edit existing feature`)
    process.exit(1)
  }

  console.log(`📦 Creating feature: ${name} (${slug})`)
  console.log(`   Type: ${options.featureType}`)
  console.log(`   Category: ${options.category}`)
  console.log(`   Icon: ${options.icon}`)
  console.log(`   Location: frontend/features/${slug}/\n`)

  // Create feature directory
  mkdirSync(featureDir, { recursive: true })

  // 1. Generate config.ts (SINGLE SOURCE OF TRUTH!)
  console.log("1️⃣  Generating config.ts (auto-discovered)...")
  const configPath = join(featureDir, "config.ts")
  writeFileSync(configPath, generateFeatureConfig(options))
  console.log(`   ✅ Created: frontend/features/${slug}/config.ts`)

  // 2. Generate frontend (if enabled)
  if (hasUI) {
    console.log("\n2️⃣  Generating frontend structure...")
    const viewsDir = join(featureDir, "views")
    const hooksDir = join(featureDir, "hooks")
    const typesDir = join(featureDir, "types")

    mkdirSync(viewsDir, { recursive: true })
    mkdirSync(hooksDir, { recursive: true })
    mkdirSync(typesDir, { recursive: true })

    const componentName = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")

    writeFileSync(join(viewsDir, `${componentName}Page.tsx`), generateFrontendPage(slug, name!))
    writeFileSync(join(hooksDir, `use${componentName}.ts`), generateHook(slug, name!))
    writeFileSync(join(typesDir, "index.ts"), generateTypes(slug))

    console.log(`   ✅ Created: frontend/features/${slug}/views/${componentName}Page.tsx`)
    console.log(`   ✅ Created: frontend/features/${slug}/hooks/use${componentName}.ts`)
    console.log(`   ✅ Created: frontend/features/${slug}/types/index.ts`)
  }

  // 3. Generate Convex handlers (if enabled)
  if (hasConvex) {
    console.log("\n3️⃣  Generating Convex handlers...")
    const convexDir = join(rootDir, "convex", "features", slug)
    mkdirSync(convexDir, { recursive: true })

    writeFileSync(join(convexDir, "queries.ts"), generateConvexQueries(slug))
    writeFileSync(join(convexDir, "mutations.ts"), generateConvexMutations(slug))

    console.log(`   ✅ Created: convex/features/${slug}/queries.ts`)
    console.log(`   ✅ Created: convex/features/${slug}/mutations.ts`)
  }

  // 4. Generate tests (if enabled)
  if (hasTests) {
    console.log("\n4️⃣  Generating test files...")
    const testsDir = join(rootDir, "tests", "features", slug)
    mkdirSync(testsDir, { recursive: true })

    writeFileSync(join(testsDir, `${slug}.test.ts`), generateTest(slug, name!))
    writeFileSync(join(testsDir, `${slug}.integration.test.ts`), generateIntegrationTest(slug, name!))

    console.log(`   ✅ Created: tests/features/${slug}/${slug}.test.ts`)
    console.log(`   ✅ Created: tests/features/${slug}/${slug}.integration.test.ts`)
  }

  // Done!
  console.log("\n✅ Feature created successfully!\n")
  console.log("📋 Next steps:")
  console.log(`   1. Edit frontend/features/${slug}/config.ts to update feature config`)
  console.log(`   2. Implement your feature logic in the generated files`)
  console.log(`   3. Run 'pnpm run sync:all' to sync manifests`)
  console.log(`   4. Run 'pnpm run validate:features' to validate`)
  console.log(`   5. Run 'pnpm test tests/features/${slug}' to test\n`)
  console.log(`💡 Tips:`)
  console.log(`   - config.ts is auto-discovered (no manual registration needed!)`)
  console.log(`   - Set status.isReady = true when ready for production`)
  console.log(`   - Add RBAC checks to all Convex queries/mutations`)
  console.log(`   - Add audit logging to all mutations\n`)
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error.message)
  process.exit(1)
})
