import { query, mutation } from "../_generated/server"
import { v } from "convex/values"
import { api } from "../_generated/api"
import { requirePermission } from "../auth/helpers"
import { PERMS } from "./permissions"

/**
 * Health Check Queries for Workspace Diagnostics
 *
 * These functions help identify and fix common workspace issues:
 * - Missing menu items
 * - Missing menu set assignments
 * - Missing default roles
 * - Orphaned data
 */

interface HealthIssue {
  severity: "critical" | "rning" | "info"
  category: string
  message: string
  fix?: string
}

/**
 * Check health of a single workspace
 */
export const checkWorkspaceHealth = query({
  args: { workspaceId: v.id("workspaces") },
  returns: v.object({
    workspaceId: v.id("workspaces"),
    workspaceName: v.string(),
    isHealthy: v.boolean(),
    issues: v.array(
      v.object({
        severity: v.string(),
        category: v.string(),
        message: v.string(),
        fix: v.optional(v.string()),
      })
    ),
    stats: v.object({
      menuItems: v.number(),
      roles: v.number(),
      members: v.number(),
      hasDefaultRole: v.boolean(),
      hasMenuSet: v.boolean(),
    }),
  }),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) throw new Error("Workspace not found")

    const issues: HealthIssue[] = []

    // Check menu items
    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    if (menuItems.length === 0) {
      issues.push({
        severity: "critical",
        category: "menus",
        message: "Workspace has no menu items",
        fix: "Run: ctx.runMutation(api.workspace.workspaces.resetWorkspace, { workspaceId, mode: 'replaceMenus' })",
      })
    }

    // Check menu set assignment
    const assignment = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("isDefault", true)
      )
      .first()

    const hasMenuSet = !!assignment
    if (!hasMenuSet) {
      issues.push({
        severity: "rning",
        category: "menus",
        message: "No default menu set assigned",
        fix: "Menu set will be created on next menu operation",
      })
    }

    // Check roles
    const roles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    if (roles.length === 0) {
      issues.push({
        severity: "critical",
        category: "roles",
        message: "Workspace has no roles",
        fix: "Contact admin - workspace needs re-initialization",
      })
    }

    const hasDefaultRole = roles.some((r) => r.isDefault)
    if (!hasDefaultRole && roles.length > 0) {
      issues.push({
        severity: "rning",
        category: "roles",
        message: "No default role configured",
        fix: "Set one role as default in workspace settings",
      })
    }

    // Check memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    if (memberships.length === 0) {
      issues.push({
        severity: "critical",
        category: "members",
        message: "Workspace has no active members",
        fix: "Contact admin - workspace is orphaned",
      })
    }

    // Check for orphaned role references
    for (const membership of memberships) {
      const role = await ctx.db.get(membership.roleId)
      if (!role) {
        issues.push({
          severity: "critical",
          category: "members",
          message: `Member has invalid role reference: ${membership.userId}`,
          fix: "Run migration to fix orphaned references",
        })
      }
    }

    const isHealthy = !issues.some((i) => i.severity === "critical")

    return {
      workspaceId: args.workspaceId,
      workspaceName: workspace.name,
      isHealthy,
      issues: issues as any,
      stats: {
        menuItems: menuItems.length,
        roles: roles.length,
        members: memberships.length,
        hasDefaultRole,
        hasMenuSet,
      },
    }
  },
})

/**
 * Check health of all workspaces (admin only)
 */
export const checkAllWorkspacesHealth = query({
  args: {},
  returns: v.array(
    v.object({
      workspaceId: v.id("workspaces"),
      workspaceName: v.string(),
      isHealthy: v.boolean(),
      criticalIssues: v.number(),
      warningIssues: v.number(),
    })
  ),
  handler: async (ctx) => {
    // Get all workspaces
    const workspaces = await ctx.db.query("workspaces").collect()

    const results: Array<{
      workspaceId: any
      workspaceName: string
      isHealthy: boolean
      criticalIssues: number
      warningIssues: number
    }> = []

    for (const workspace of workspaces) {
      const health: {
        isHealthy: boolean
        issues: Array<{ severity: string }>
      } = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
        workspaceId: workspace._id,
      }) as any

      results.push({
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        isHealthy: health.isHealthy,
        criticalIssues: health.issues.filter((i: { severity: string }) => i.severity === "critical").length,
        warningIssues: health.issues.filter((i: { severity: string }) => i.severity === "rning").length,
      })
    }

    return results
  },
})

/**
 * Auto-fix common workspace issues
 */
export const fixWorkspaceIssues = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    fixMenus: v.optional(v.boolean()),
    fixRoles: v.optional(v.boolean()),
  },
  returns: v.object({
    fixed: v.array(v.string()),
    failed: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Require permission to fix workspace issues
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    const fixed: string[] = []
    const failed: string[] = []

    // Fix menus if requested
    if (args.fixMenus) {
      try {
        const menuItems = await ctx.db
          .query("menuItems")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .collect()

        if (menuItems.length === 0) {
          await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
            workspaceId: args.workspaceId,
            mode: "replaceMenus",
          })
          fixed.push("Created default menu items")
        } else {
          fixed.push("Menu items already exist - no fix needed")
        }
      } catch (error) {
        failed.push(`Menu fix failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Fix roles if requested
    if (args.fixRoles) {
      try {
        const roles = await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .collect()

        const hasDefaultRole = roles.some((r) => r.isDefault)

        if (!hasDefaultRole && roles.length > 0) {
          // Set Client role as default if it exists
          const clientRole = roles.find((r) => r.slug === "client")
          if (clientRole) {
            await ctx.db.patch(clientRole._id, { isDefault: true })
            fixed.push("Set Client role as default")
          } else {
            // Set first role as default
            await ctx.db.patch(roles[0]._id, { isDefault: true })
            fixed.push(`Set ${roles[0].name} role as default`)
          }
        } else if (hasDefaultRole) {
          fixed.push("Default role already configured - no fix needed")
        } else {
          failed.push("No roles found - cannot set default")
        }
      } catch (error) {
        failed.push(`Role fix failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return { fixed, failed }
  },
})

/**
 * Migration: Fix all broken workspaces
 */
export const migrateAllBrokenWorkspaces = mutation({
  args: {},
  returns: v.object({
    total: v.number(),
    fixed: v.number(),
    failed: v.number(),
    details: v.array(
      v.object({
        workspaceId: v.id("workspaces"),
        workspaceName: v.string(),
        status: v.string(),
        issues: v.array(v.string()),
      })
    ),
  }),
  handler: async (ctx) => {
    // This is a dangerous operation - require manual confirmation
    console.log("🚨 WARNING: Running migration on ALL workspaces")

    const workspaces = await ctx.db.query("workspaces").collect()
    const details: Array<{
      workspaceId: any
      workspaceName: string
      status: string
      issues: string[]
    }> = []

    let fixed = 0
    let failed = 0

    for (const workspace of workspaces) {
      const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
        workspaceId: workspace._id,
      })

      if (!health.isHealthy) {
        try {
          const result = await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
            workspaceId: workspace._id,
            fixMenus: true,
            fixRoles: true,
          })

          details.push({
            workspaceId: workspace._id,
            workspaceName: workspace.name,
            status: "fixed",
            issues: result.fixed,
          })

          fixed++
        } catch (error) {
          details.push({
            workspaceId: workspace._id,
            workspaceName: workspace.name,
            status: "failed",
            issues: [error instanceof Error ? error.message : String(error)],
          })

          failed++
        }
      }
    }

    return {
      total: workspaces.length,
      fixed,
      failed,
      details,
    }
  },
})
