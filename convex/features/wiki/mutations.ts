import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership } from "../../auth/helpers"

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

async function ensureUniqueSlug(ctx: any, workspaceId: any, title: string, existingSlug?: string | null) {
  const baseSlug = slugify(title) || slugify(existingSlug ?? "") || `page-${Math.random().toString(36).slice(2, 8)}`
  let candidate = baseSlug
  let suffix = 1

  while (true) {
    const conflict = await ctx.db
      .query("wiki")
      .withIndex("by_workspace_slug", (q: any) => q.eq("workspaceId", workspaceId).eq("slug", candidate))
      .first()
    if (!conflict) {
      return candidate
    }
    candidate = `${baseSlug}-${suffix++}`
  }
}

/**
 * Wiki Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requireActiveMembership(ctx, args.workspaceId)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const slug = await ensureUniqueSlug(ctx, args.workspaceId, args.title)

    const doc: any = {
      workspaceId: args.workspaceId,
      title: args.title,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
      updatedBy: actorId,
      slug,
      isPublished: args.isPublished ?? true,
    }

    if (args.summary !== undefined) doc.summary = args.summary
    if (args.category !== undefined) doc.category = args.category

    const itemId = await ctx.db.insert("wiki", doc)

    // TODO: Add audit log
    // await logAudit(ctx, {
    //   action: "wiki:create",
    //   workspaceId: args.workspaceId,
    //   targetId: itemId,
    // })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("wiki"),
    patch: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      summary: v.optional(v.union(v.string(), v.null())),
      category: v.optional(v.union(v.string(), v.null())),
      isPublished: v.optional(v.boolean()),
      regenerateSlug: v.optional(v.boolean()),
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

    if (patch.title !== undefined) updates.title = patch.title
    if (patch.content !== undefined) updates.content = patch.content
    if (patch.summary !== undefined) updates.summary = patch.summary === null ? undefined : patch.summary
    if (patch.category !== undefined) updates.category = patch.category === null ? undefined : patch.category
    if (patch.isPublished !== undefined) updates.isPublished = patch.isPublished

    if (patch.regenerateSlug || patch.title !== undefined) {
      const nextTitle = patch.title ?? item.title
      updates.slug = await ensureUniqueSlug(ctx, item.workspaceId, nextTitle, item.slug)
    }

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("wiki"),
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
