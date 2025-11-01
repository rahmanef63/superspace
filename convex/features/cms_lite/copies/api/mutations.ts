import { mutation } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * Create or update a copy entry
 */
export const upsertCopy = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    group: v.string(),
    status: v.string(),
    translations: v.record(v.string(), v.object({
      content: v.string(),
      description: v.optional(v.string()),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    })),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("copies")
      .withIndex("by_workspace_key", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("key", args.key)
      )
      .unique();

    if (existing) {
      // Create history entry for tracking changes
      await ctx.db.insert("copyHistory", {
        copyId: existing._id,
        locale: Object.keys(args.translations)[0], // Track the changed locale
        previousContent: existing.translations[Object.keys(args.translations)[0]]?.content || "",
        changeNote: "Updated via API",
        createdBy: args.translations[Object.keys(args.translations)[0]]?.updatedBy,
      });

      // Update existing copy
      return await ctx.db.patch(existing._id, {
        translations: {
          ...existing.translations,
          ...args.translations,
        },
        status: args.status,
        tags: args.tags,
        notes: args.notes,
        lastReviewedAt: Date.now(),
        lastReviewedBy: args.translations[Object.keys(args.translations)[0]]?.updatedBy,
      });
    } else {
      // Create new copy
      return await ctx.db.insert("copies", {
        workspaceId: args.workspaceId,
        key: args.key,
        group: args.group,
        status: args.status,
        translations: args.translations,
        tags: args.tags,
        notes: args.notes,
        lastReviewedAt: Date.now(),
        lastReviewedBy: args.translations[Object.keys(args.translations)[0]]?.updatedBy,
      });
    }
  },
});

/**
 * Create or update a copy group
 */
export const upsertGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    displayNames: v.record(v.string(), v.string()),
    description: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("copyGroups")
      .withIndex("by_name", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        displayNames: args.displayNames,
        description: args.description,
        status: args.status,
      });
    } else {
      // Get count of copies in this group
      const copyCount = (await ctx.db
        .query("copies")
        .withIndex("by_group", (q: any) =>
          q.eq("workspaceId", args.workspaceId).eq("group", args.name)
        )
        .collect()).length;

      return await ctx.db.insert("copyGroups", {
        workspaceId: args.workspaceId,
        name: args.name,
        displayNames: args.displayNames,
        description: args.description,
        status: args.status,
        copyCount: copyCount,
      });
    }
  },
});

/**
 * Delete a copy entry
 */
export const deleteCopy = mutation({
  args: {
    copyId: v.id("copies"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.copyId);
    return true;
  },
});

/**
 * Delete a copy group and all associated copies
 */
export const deleteGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // First delete the group
    const group = await ctx.db
      .query("copyGroups")
      .withIndex("by_name", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (group) {
      await ctx.db.delete(group._id);
    }

    // Then delete all copies in this group
    const copies = await ctx.db
      .query("copies")
      .withIndex("by_group", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("group", args.name)
      )
      .collect();

    for (const copy of copies) {
      await ctx.db.delete(copy._id);
    }

    return true;
  },
});

