import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for BI feature
 */

export const createDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("biDashboards", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      widgets: [],
      isDefault: false,
      isPublic: false,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { id, success: true }
  },
})

export const updateDashboard = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    dashboardId: v.id("biDashboards"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    widgets: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      config: v.record(v.string(), v.any()),
    }))),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const dashboard = await ctx.db.get(args.dashboardId)
    if (!dashboard || dashboard.workspaceId !== args.workspaceId) {
      throw new Error("Dashboard not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.widgets !== undefined) {
      updates.widgets = args.widgets
    }

    await ctx.db.patch(args.dashboardId, updates)

    return { success: true }
  },
})
