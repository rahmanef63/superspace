import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

/**
 * Calendar Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Require permission
    await requireActiveMembership(ctx, args.workspaceId)

    const itemId = await ctx.db.insert("calendar", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // TODO: Add audit log
    // await logAudit(ctx, {
    //   action: "calendar:create",
    //   workspaceId: args.workspaceId,
    //   targetId: itemId,
    // })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("calendar"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    await requireActiveMembership(ctx, item.workspaceId)

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("calendar"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    await requireActiveMembership(ctx, item.workspaceId)

    await ctx.db.delete(args.id)

    return args.id
  },
})
