import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

/**
 * Calendar Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requireActiveMembership(ctx, args.workspaceId)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    if (args.endsAt !== undefined && args.endsAt < args.startsAt) {
      throw new Error("Event end time must be after start time")
    }

    const doc: any = {
      workspaceId: args.workspaceId,
      title: args.title,
      startsAt: args.startsAt,
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
      updatedBy: actorId,
    }

    if (args.description !== undefined) doc.description = args.description
    if (args.location !== undefined) doc.location = args.location
    if (args.allDay !== undefined) doc.allDay = args.allDay
    if (args.endsAt !== undefined) doc.endsAt = args.endsAt

    const itemId = await ctx.db.insert("calendar", doc)

    await logAuditEvent(ctx, {
      action: "calendar.create",
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: "calendar",
      resourceId: itemId,
      changes: { title: args.title, startsAt: args.startsAt },
    })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("calendar"),
    patch: v.object({
      title: v.optional(v.string()),
      startsAt: v.optional(v.number()),
      endsAt: v.optional(v.union(v.number(), v.null())),
      description: v.optional(v.union(v.string(), v.null())),
      location: v.optional(v.union(v.string(), v.null())),
      allDay: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requireActiveMembership(ctx, item.workspaceId)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const { patch } = args

    const nextStartsAt: number = patch.startsAt ?? item.startsAt
    const nextEndsAt: number | null =
      patch.endsAt === undefined ? item.endsAt ?? null : patch.endsAt

    if (nextEndsAt !== null && nextEndsAt < nextStartsAt) {
      throw new Error("Event end time must be after start time")
    }

    const updates: any = {
      updatedAt: now,
      updatedBy: actorId,
    }

    if (patch.title !== undefined) updates.title = patch.title
    if (patch.startsAt !== undefined) updates.startsAt = patch.startsAt
    if (patch.endsAt !== undefined) updates.endsAt = patch.endsAt === null ? undefined : patch.endsAt
    if (patch.description !== undefined) updates.description = patch.description === null ? undefined : patch.description
    if (patch.location !== undefined) updates.location = patch.location === null ? undefined : patch.location
    if (patch.allDay !== undefined) updates.allDay = patch.allDay

    await ctx.db.patch(args.id, updates)

    await logAuditEvent(ctx, {
      action: "calendar.update",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "calendar",
      resourceId: args.id,
      changes: patch,
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
    const { membership } = await requireActiveMembership(ctx, item.workspaceId)
    const actorId = membership?.userId ?? (await ensureUser(ctx))

    await ctx.db.delete(args.id)

    await logAuditEvent(ctx, {
      action: "calendar.delete",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "calendar",
      resourceId: args.id,
    })

    return args.id
  },
})
