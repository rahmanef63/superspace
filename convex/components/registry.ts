import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, requirePermission } from "../auth/helpers";

/**
 * Component Registry Manager
 * Manage component versioning, aliases, and binding to menu items with audit logging
 */

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

    // Validate key format (alphanumeric with hyphens/underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(args.key)) {
      throw new Error("Component key must be alphanumeric with hyphens/underscores only");
    }

    // Uniqueness by (workspaceId,key) is by convention
    const existing = await ctx.db
      .query("components")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    if (existing.some((c: any) => String(c.workspaceId || "") === String(args.workspaceId || ""))) {
      throw new Error("Component key already exists in this scope");
    }

    const componentId = await ctx.db.insert("components", {
      workspaceId: args.workspaceId,
      key: args.key,
      createdBy: userId,
    });

    // Write audit event
    if (args.workspaceId) {
      await ctx.db.insert("activityEvents", {
        actorUserId: userId,
        workspaceId: args.workspaceId,
        entityType: "component",
        entityId: String(componentId),
        action: "component_created",
        diff: { key: args.key },
        createdAt: Date.now(),
      });
    }

    return componentId;
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
    const userId = await ensureUser(ctx);
    const component = await ctx.db.get(args.componentId);
    if (!component) throw new Error("Component not found");

    // Validate version format (semver)
    if (!/^\d+\.\d+\.\d+$/.test(args.version)) {
      throw new Error("Version must be in semver format (e.g., 1.0.0)");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("componentVersions")
      .withIndex("by_component_version", (q) => q.eq("componentId", args.componentId).eq("version", args.version))
      .unique();
    if (existing) throw new Error("Version already exists for this component");

    const versionId = await ctx.db.insert("componentVersions", {
      ...args,
      schemaVersion: args.schemaVersion || 1,
      createdAt: now,
      updatedAt: now,
    } as any);

    // Write audit event
    if (component.workspaceId) {
      await ctx.db.insert("activityEvents", {
        actorUserId: userId,
        workspaceId: component.workspaceId,
        entityType: "component_version",
        entityId: String(versionId),
        action: "component_version_created",
        diff: {
          componentKey: component.key,
          version: args.version,
          type: args.type,
          status: args.status,
        },
        createdAt: Date.now(),
      });
    }

    return versionId;
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
    const versions = await ctx.db
      .query("componentVersions")
      .withIndex("by_component", (q) => q.eq("componentId", args.componentId))
      .collect();

    // Sort by semver (newest first)
    return versions.sort((a, b) => {
      const aParts = a.version.split(".").map(Number);
      const bParts = b.version.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        if (bParts[i] !== aParts[i]) return bParts[i] - aParts[i];
      }
      return 0;
    });
  },
});

// Update component version status with audit trail
export const updateVersionStatus = mutation({
  args: {
    versionId: v.id("componentVersions"),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("deprecated")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error("Component version not found");

    const component = await ctx.db.get(version.componentId);
    if (!component) throw new Error("Component not found");

    const oldStatus = version.status;

    await ctx.db.patch(args.versionId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Write audit event
    if (component.workspaceId) {
      await ctx.db.insert("activityEvents", {
        actorUserId: userId,
        workspaceId: component.workspaceId,
        entityType: "component_version",
        entityId: String(args.versionId),
        action: "component_version_status_updated",
        diff: {
          componentKey: component.key,
          version: version.version,
          oldStatus,
          newStatus: args.status,
        },
        createdAt: Date.now(),
      });
    }

    return args.versionId;
  },
});

// Search components by key, alias, or category
export const searchComponents = query({
  args: {
    query: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    type: v.optional(v.union(v.literal("ui"), v.literal("layout"), v.literal("data"), v.literal("action"))),
  },
  handler: async (ctx, args) => {
    const lowerQuery = args.query.toLowerCase();

    // Search components by key in scope
    const components = await ctx.db
      .query("components")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const matchedComponents: Array<{
      component: any;
      version: any;
      matchType: "key" | "alias" | "category";
    }> = [];

    for (const component of components) {
      // Match by key
      if (component.key.toLowerCase().includes(lowerQuery)) {
        const activeVersion = await ctx.db
          .query("componentVersions")
          .withIndex("by_component", (q) => q.eq("componentId", component._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .order("desc")
          .first();

        if (activeVersion && (!args.type || activeVersion.type === args.type)) {
          matchedComponents.push({
            component,
            version: activeVersion,
            matchType: "key",
          });
        }
      }

      // Match by category in versions
      const versions = await ctx.db
        .query("componentVersions")
        .withIndex("by_component", (q) => q.eq("componentId", component._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      for (const version of versions) {
        if (!args.type || version.type === args.type) {
          if (version.category.toLowerCase().includes(lowerQuery)) {
            matchedComponents.push({
              component,
              version,
              matchType: "category",
            });
          }
        }
      }
    }

    // Deduplicate by component+version
    const seen = new Set<string>();
    return matchedComponents.filter((item) => {
      const key = `${item.component._id}_${item.version._id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
});

// List all components for a workspace (or system)
export const listComponents = query({
  args: { workspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, args) => {
    const components = await ctx.db
      .query("components")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Get latest active version for each component
    const enriched = await Promise.all(
      components.map(async (component) => {
        const activeVersion = await ctx.db
          .query("componentVersions")
          .withIndex("by_component", (q) => q.eq("componentId", component._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .order("desc")
          .first();

        return {
          ...component,
          latestActiveVersion: activeVersion,
        };
      })
    );

    return enriched;
  },
});
