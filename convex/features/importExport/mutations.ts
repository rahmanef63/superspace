import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for import/export feature
 */

export const startImport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    format: v.string(),
    fileName: v.optional(v.string()),
    options: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("importExportHistory", {
      workspaceId: args.workspaceId,
      type: "import",
      entityType: args.entityType,
      format: args.format,
      fileName: args.fileName,
      status: "pending",
      options: args.options,
      userId,
      startedAt: Date.now(),
    })

    // TODO: Process import in background

    return { id, success: true }
  },
})

export const startExport = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    format: v.string(),
    options: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("importExportHistory", {
      workspaceId: args.workspaceId,
      type: "export",
      entityType: args.entityType,
      format: args.format,
      status: "pending",
      options: args.options,
      userId,
      startedAt: Date.now(),
    })

    // TODO: Process export in background

    return { id, success: true }
  },
})
