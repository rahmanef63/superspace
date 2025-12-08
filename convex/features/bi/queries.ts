import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for BI feature
 */

export const getDashboards = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const dashboards = await ctx.db
      .query("biDashboards")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return dashboards
  },
})

export const getMetrics = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Return placeholder metrics - in real app, aggregate from various sources
    return {
      revenue: 125000,
      customers: 1234,
      orders: 567,
      conversionRate: 3.2,
    }
  },
})
