import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for search feature
 */

export const search = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Log this search
    await ctx.db.insert("searchHistory", {
      workspaceId: args.workspaceId,
      userId,
      query: args.query,
      resultsCount: 0,
      entities: [],
      timestamp: Date.now(),
    })

    return { success: true }
  },
})

export const saveSearch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    name: v.optional(v.string()),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("savedSearches", {
      workspaceId: args.workspaceId,
      userId,
      query: args.query,
      name: args.name || args.query,
      description: undefined,
      filters: args.filters ? [args.filters] : undefined,
      sort: undefined,
      tags: [],
      entities: [],
      isPublic: false,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { id, success: true }
  },
})

export const deleteSearch = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    searchId: v.id("savedSearches"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const search = await ctx.db.get(args.searchId)
    if (!search || search.workspaceId !== args.workspaceId) {
      throw new Error("Search not found")
    }

    await ctx.db.delete(args.searchId)

    return { success: true }
  },
})
