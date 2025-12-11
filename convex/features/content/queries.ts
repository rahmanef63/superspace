import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for content feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get documents/pages as content items
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    // Since documents table doesn't have status/views, return basic counts
    const totalItems = documents.length

    // Format recent content
    const recentContent = documents.slice(0, 10).map(doc => ({
      id: doc._id,
      title: doc.title || "Untitled",
      type: "article" as "article" | "page" | "video" | "image",
      author: "User",
      status: "draft" as "published" | "draft" | "scheduled" | "archived",
      views: 0,
    }))

    return {
      stats: {
        totalItems,
        published: 0,
        drafts: totalItems,
        scheduled: 0,
        views: 0,
      },
      recentContent,
    }
  },
})
