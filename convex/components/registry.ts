import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, requirePermission } from "../auth/helpers";

// Create a component registry entry
export const createComponent = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")), // null => system component
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (args.workspaceId) {
      await requirePermission(ctx, args.workspaceId, "MANAGE_MENUS");
    }

    // Uniqueness by (workspaceId,key) is by convention
    const existing = await ctx.db
      .query("components")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    if (existing.some((c: any) => String(c.workspaceId || "") === String(args.workspaceId || ""))) {
      throw new Error("Component key already exists in this scope");
    }

    return await ctx.db.insert("components", {
      workspaceId: args.workspaceId,
      key: args.key,
      createdBy: userId,
    });
  },
});

// Add a component version
export const addComponentVersion = mutation({
  args: {
    componentId: v.id("components"),
    version: v.string(),
    category: v.string(),
    type: v.union(v.literal("ui"), v.literal("layout"), v.literal("data"), v.literal("action")),
    propsSchema: v.optional(v.object({})),
    defaultProps: v.optional(v.object({})),
    slots: v.optional(v.object({})),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("deprecated")),
    schemaVersion: v.optional(v.number()),
    migrations: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("componentVersions")
      .withIndex("by_component_version", (q) => q.eq("componentId", args.componentId).eq("version", args.version))
      .unique();
    if (existing) throw new Error("Version already exists for this component");

    return await ctx.db.insert("componentVersions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    } as any);
  },
});

// Create an alias to a specific component version
export const addAlias = mutation({
  args: {
    alias: v.string(),
    componentVersionId: v.id("componentVersions"),
    displayName: v.optional(v.string()),
    category: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Enforce unique alias
    const existing = await ctx.db
      .query("componentAliases")
      .withIndex("by_alias", (q) => q.eq("alias", args.alias))
      .unique();
    if (existing) throw new Error("Alias already exists");

    return await ctx.db.insert("componentAliases", args as any);
  },
});

// Resolve alias to component+version
export const resolveAlias = query({
  args: { alias: v.string() },
  handler: async (ctx, args) => {
    const alias = await ctx.db
      .query("componentAliases")
      .withIndex("by_alias", (q) => q.eq("alias", args.alias))
      .unique();
    if (!alias) return null as any;

    const version = await ctx.db.get(alias.componentVersionId);
    if (!version) return null as any;
    const component = await ctx.db.get(version.componentId);
    return { alias, version, component };
  },
});

// Get component by key in a scope
export const getComponentByKey = query({
  args: { workspaceId: v.optional(v.id("workspaces")), key: v.string() },
  handler: async (ctx, args) => {
    const comps = await ctx.db
      .query("components")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    return comps.find((c: any) => String(c.workspaceId || "") === String(args.workspaceId || "")) || null;
  },
});

// List versions for a component
export const listComponentVersions = query({
  args: { componentId: v.id("components") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("componentVersions")
      .withIndex("by_component", (q) => q.eq("componentId", args.componentId))
      .collect();
  },
});
