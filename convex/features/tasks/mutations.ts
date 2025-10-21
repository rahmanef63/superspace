import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership } from "../../auth/helpers"

const TASK_STATUS = v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed"))
const TASK_PRIORITY = v.union(v.literal("low"), v.literal("medium"), v.literal("high"))

/**
 * Tasks Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(TASK_STATUS),
    priority: v.optional(TASK_PRIORITY),
    dueDate: v.optional(v.number()),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requireActiveMembership(ctx, args.workspaceId)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const doc: any = {
      workspaceId: args.workspaceId,
      title: args.title,
      status: args.status ?? "todo",
      priority: args.priority ?? "medium",
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
      updatedBy: actorId,
    }

    if (args.description !== undefined) doc.description = args.description
    if (args.dueDate !== undefined) doc.dueDate = args.dueDate
    if (args.assigneeId !== undefined) doc.assigneeId = args.assigneeId
    if ((args.status ?? "todo") === "completed") {
      doc.completedAt = now
    }

    const itemId = await ctx.db.insert("tasks", doc)

    // TODO: Add audit log
    // await logAudit(ctx, {
    //   action: "tasks:create",
    //   workspaceId: args.workspaceId,
    //   targetId: itemId,
    // })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("tasks"),
    patch: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.union(v.string(), v.null())),
      status: v.optional(TASK_STATUS),
      priority: v.optional(TASK_PRIORITY),
      dueDate: v.optional(v.union(v.number(), v.null())),
      assigneeId: v.optional(v.union(v.id("users"), v.null())),
    }),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requireActiveMembership(ctx, item.workspaceId)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const updates: any = {
      updatedAt: now,
      updatedBy: actorId,
    }

    const { patch } = args

    if (patch.title !== undefined) {
      updates.title = patch.title
    }

    if (patch.description !== undefined) {
      updates.description = patch.description === null ? undefined : patch.description
    }

    if (patch.priority !== undefined) {
      updates.priority = patch.priority
    }

    if (patch.status !== undefined) {
      updates.status = patch.status
      updates.completedAt = patch.status === "completed" ? now : undefined
    }

    if (patch.dueDate !== undefined) {
      updates.dueDate = patch.dueDate === null ? undefined : patch.dueDate
    }

    if (patch.assigneeId !== undefined) {
      updates.assigneeId = patch.assigneeId === null ? undefined : patch.assigneeId
    }

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("tasks"),
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
