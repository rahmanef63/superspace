import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for marketing feature
 */

export const getCampaigns = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .collect()

    return campaigns
  },
})

export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get aggregate stats
    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const emailsSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0)
    const opens = campaigns.reduce((sum, c) => sum + (c.opens || 0), 0)
    const openRate = emailsSent > 0 ? Math.round((opens / emailsSent) * 100) : 0

    return {
      emailsSent,
      openRate,
      subscribers: 0, // TODO: Get from subscribers table
      conversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
    }
  },
})
