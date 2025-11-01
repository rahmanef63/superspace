import { mutation } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * Create or update a feature
 */
export const upsertFeature = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    status: v.string(),
    type: v.string(),
    displayOrder: v.optional(v.number()),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    })),
    settings: v.optional(v.record(v.string(), v.any())),
    requiredRoles: v.optional(v.array(v.string())),
    dependencies: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      version: v.optional(v.string()),
      lastTestedAt: v.optional(v.number()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    const now = Date.now();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        status: args.status,
        type: args.type,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        translations: args.translations,
        settings: args.settings,
        requiredRoles: args.requiredRoles,
        dependencies: args.dependencies,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: args.updatedBy,
      });
    }

    // Find highest display order if not provided
    let displayOrder = args.displayOrder;
    if (displayOrder === undefined) {
      const lastFeature = await ctx.db
        .query("features")
        .withIndex("by_display_order", (q) =>
          q.eq("workspaceId", args.workspaceId)
        )
        .order("desc")
        .first();
      displayOrder = (lastFeature?.displayOrder || 0) + 1;
    }

    return await ctx.db.insert("features", {
      workspaceId: args.workspaceId,
      key: args.key,
      status: args.status,
      type: args.type,
      displayOrder,
      translations: args.translations,
      settings: args.settings,
      requiredRoles: args.requiredRoles,
      dependencies: args.dependencies,
      metadata: args.metadata,
      createdAt: now,
      createdBy: args.updatedBy,
      updatedAt: now,
      updatedBy: args.updatedBy,
    });
  },
});

/**
 * Create or update a feature group
 */
export const upsertGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    status: v.string(),
    displayOrder: v.optional(v.number()),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    })),
    features: v.array(v.string()),
    metadata: v.optional(v.object({
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("featureGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        status: args.status,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        translations: args.translations,
        features: args.features,
        metadata: args.metadata,
        updatedAt: now,
      });
    }

    // Find highest display order if not provided
    let displayOrder = args.displayOrder;
    if (displayOrder === undefined) {
      const lastGroup = await ctx.db
        .query("featureGroups")
        .withIndex("by_display_order", (q) =>
          q.eq("workspaceId", args.workspaceId)
        )
        .order("desc")
        .first();
      displayOrder = (lastGroup?.displayOrder || 0) + 1;
    }

    return await ctx.db.insert("featureGroups", {
      workspaceId: args.workspaceId,
      name: args.name,
      status: args.status,
      displayOrder,
      translations: args.translations,
      features: args.features,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Delete a feature
 */
export const deleteFeature = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    if (!feature) {
      throw new Error("Feature not found");
    }

    // Remove from any groups
    const groups = await ctx.db
      .query("featureGroups")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const group of groups) {
      if (group.features.includes(args.key)) {
        await ctx.db.patch(group._id, {
          features: group.features.filter(f => f !== args.key),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.delete(feature._id);
    return true;
  },
});

/**
 * Delete a feature group
 */
export const deleteGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("featureGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (!group) {
      throw new Error("Group not found");
    }

    await ctx.db.delete(group._id);
    return true;
  },
});

