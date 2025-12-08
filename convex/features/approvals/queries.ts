import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Queries for approvals feature
 */

export const getPendingApprovals = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) return []

    const userId = candidateIds[0] as Id<"users">

    // Get approvals where current user is an approver
    const approvals = await ctx.db
      .query("approvalRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    // Filter to only those where user is an approver
    return approvals.filter((a) => a.approvers?.includes(userId))
  },
})

export const getMyRequests = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) return []

    const userId = candidateIds[0] as Id<"users">

    const requests = await ctx.db
      .query("approvalRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("requesterId"), userId))
      .collect()

    return requests
  },
})

export const getRequestById = query({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      return null
    }

    return request
  },
})
