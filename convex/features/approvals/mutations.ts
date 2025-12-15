import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import type { Id } from "../../_generated/dataModel"
import { logAuditEvent } from "../../shared/audit"

/**
 * Mutations for approvals feature
 */

export const createRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("expense"),
      v.literal("leave"),
      v.literal("document"),
      v.literal("purchase"),
      v.literal("custom")
    )),
    approvers: v.array(v.id("users")),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    dueDate: v.optional(v.number()),
    data: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("approvalRequests", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      type: args.type ?? "custom",
      status: "pending",
      priority: args.priority ?? "normal",
      requesterId: userId,
      approvers: args.approvers,
      approvalHistory: [],
      data: args.data,
      dueDate: args.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { id, success: true }
  },
})

export const approveRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      throw new Error("Request not found")
    }

    if (!request.approvers?.includes(userId)) {
      throw new Error("Not authorized to approve this request")
    }

    const history = request.approvalHistory || []
    history.push({
      userId,
      action: "approved",
      comment: args.comment,
      timestamp: Date.now(),
    })

    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvalHistory: history,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const rejectRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      throw new Error("Request not found")
    }

    if (!request.approvers?.includes(userId)) {
      throw new Error("Not authorized to reject this request")
    }

    const history = request.approvalHistory || []
    history.push({
      userId,
      action: "rejected",
      comment: args.reason,
      timestamp: Date.now(),
    })

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvalHistory: history,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})
