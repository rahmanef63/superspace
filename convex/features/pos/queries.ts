import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for POS feature
 */

export const getProducts = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const products = await ctx.db
      .query("posProducts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    return products
  },
})

export const getTodaySales = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const todayStart = new Date().setHours(0, 0, 0, 0)

    const transactions = await ctx.db
      .query("posTransactions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("createdAt"), todayStart))
      .collect()

    const total = transactions.reduce((sum, t) => sum + (t.total || 0), 0)
    const count = transactions.length

    return { total, count }
  },
})
