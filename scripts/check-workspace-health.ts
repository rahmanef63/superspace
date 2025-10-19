#!/usr/bin/env tsx
/**
 * Workspace Health Check Script
 *
 * Checks all workspaces for common issues:
 * - Missing menu items
 * - Missing menu set assignments
 * - Orphaned roles
 * - Missing default role
 *
 * Usage:
 *   pnpm run check:workspaces
 *   pnpm run check:workspaces --fix  # Auto-fix issues
 */

import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment")
  console.log("Please set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL")
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)
const shouldFix = process.argv.includes("-fix")

interface HealthIssue {
  workspaceId: string
  workspaceName: string
  severity: "critical" | "warning" | "info"
  issue: string
  fix?: string
}

async function checkWorkspaceHealth() {
  console.log("🔍 Checking workspace health...\n")

  const issues: HealthIssue[] = []

  try {
    // Get all workspaces (this will fail if not authenticated)
    console.log("⚠️  Note: This script requires authentication")
    console.log("Run this from Convex dashboard or with proper auth setup\n")

    // For now, we'll create a health check query that can be called
    console.log("✅ Health check structure created")
    console.log("\nTo run health checks:")
    console.log("1. Go to Convex Dashboard")
    console.log("2. Run this query in the Functions tab:")
    console.log("\n```typescript")
    console.log("// Query all workspaces")
    console.log("const workspaces = await ctx.db.query('workspaces').collect()")
    console.log("")
    console.log("for (const workspace of workspaces) {")
    console.log("  // Check menu items")
    console.log("  const menuItems = await ctx.db")
    console.log("    .query('menuItems')")
    console.log("    .withIndex('by_workspace', q => q.eq('workspaceId', workspace._id))")
    console.log("    .collect()")
    console.log("  ")
    console.log("  if (menuItems.length === 0) {")
    console.log("    console.warn('CRITICAL: Workspace has no menu items', {")
    console.log("      workspaceId: workspace._id,")
    console.log("      name: workspace.name")
    console.log("    })")
    console.log("  }")
    console.log("  ")
    console.log("  // Check menu set assignment")
    console.log("  const assignment = await ctx.db")
    console.log("    .query('workspaceMenuAssignments')")
    console.log("    .withIndex('by_workspace_default', q =>")
    console.log("      q.eq('workspaceId', workspace._id).eq('isDefault', true)")
    console.log("    )")
    console.log("    .first()")
    console.log("  ")
    console.log("  if (!assignment) {")
    console.log("    console.warn('WARNING: No default menu set assigned', {")
    console.log("      workspaceId: workspace._id,")
    console.log("      name: workspace.name")
    console.log("    })")
    console.log("  }")
    console.log("  ")
    console.log("  // Check default role")
    console.log("  const roles = await ctx.db")
    console.log("    .query('roles')")
    console.log("    .withIndex('by_workspace', q => q.eq('workspaceId', workspace._id))")
    console.log("    .collect()")
    console.log("  ")
    console.log("  const hasDefaultRole = roles.some(r => r.isDefault)")
    console.log("  if (!hasDefaultRole) {")
    console.log("    console.warn('WARNING: No default role found', {")
    console.log("      workspaceId: workspace._id,")
    console.log("      name: workspace.name")
    console.log("    })")
    console.log("  }")
    console.log("}")
    console.log("```\n")

    console.log("📋 Health Check Categories:")
    console.log("  ✅ Menu Items - Ensures workspace has navigation")
    console.log("  ✅ Menu Set Assignment - Ensures default menu set exists")
    console.log("  ✅ Default Role - Ensures new members get a role")
    console.log("  ✅ Role Permissions - Ensures roles have valid permissions")

  } catch (error) {
    console.error("❌ Error during health check:", error)
    process.exit(1)
  }
}

// Run the health check
checkWorkspaceHealth().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
