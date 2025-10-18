import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Wiki Queries
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
      .query("wiki")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect()

    return items
  },
})

// Get single item
export const get = query({
  args: {
    id: v.id("wiki"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) return null

    // Verify access
    await requireActiveMembership(ctx, item.workspaceId)

    return item
  },
})
