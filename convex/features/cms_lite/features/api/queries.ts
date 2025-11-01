import { query } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * Get all features for a workspace
 */
export const listAll = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const features = await ctx.db
      .query("features")
      .withIndex("by_display_order", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .collect();

    return features.map(feature => ({
      ...feature,
      title: feature.translations[args.locale]?.title || 
             feature.translations["en"]?.title || 
             feature.key,
      description: feature.translations[args.locale]?.description || 
                  feature.translations["en"]?.description,
      icon: feature.translations[args.locale]?.icon || 
            feature.translations["en"]?.icon,
    }));
  },
});

/**
 * Get active features for a workspace
 */
export const listActive = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("features")
      .withIndex("by_display_order", (queryBuilder) =>
        queryBuilder.eq("workspaceId", args.workspaceId)
      )
      .filter((queryBuilder) => queryBuilder.eq("status", "active"));

    if (args.type) {
      q = q.filter((q) => q.eq("type", args.type));
    }

    const features = await q.order("asc").collect();

    return features.map(feature => ({
      ...feature,
      title: feature.translations[args.locale]?.title || 
             feature.translations["en"]?.title || 
             feature.key,
      description: feature.translations[args.locale]?.description || 
                  feature.translations["en"]?.description,
      icon: feature.translations[args.locale]?.icon || 
            feature.translations["en"]?.icon,
    }));
  },
});

/**
 * Get all feature groups for a workspace
 */
export const listGroups = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("featureGroups")
      .withIndex("by_display_order", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .collect();

    return groups.map(group => ({
      ...group,
      title: group.translations[args.locale]?.title || 
             group.translations["en"]?.title || 
             group.name,
      description: group.translations[args.locale]?.description || 
                  group.translations["en"]?.description,
      icon: group.translations[args.locale]?.icon || 
            group.translations["en"]?.icon,
    }));
  },
});

/**
 * Get feature details
 */
export const getFeature = query({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    if (!feature) return null;

    return {
      ...feature,
      title: feature.translations[args.locale]?.title || 
             feature.translations["en"]?.title || 
             feature.key,
      description: feature.translations[args.locale]?.description || 
                  feature.translations["en"]?.description,
      icon: feature.translations[args.locale]?.icon || 
            feature.translations["en"]?.icon,
    };
  },
});

