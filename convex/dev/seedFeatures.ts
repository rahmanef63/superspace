/**
 * Developer Utility: Seed and manage menu features with version control
 * 
 * This script provides deterministic menu management using slugs as stable identifiers
 * instead of relying on random Convex IDs.
 * 
 * Usage examples:
 * 1. Seed a specific feature: seedMenuFeature(workspaceId, "chat", "1.0.0")
 * 2. Update a feature: seedMenuFeature(workspaceId, "documents", "1.3.0", true)
 * 3. Batch seed features: seedMultipleFeatures(workspaceId, ["chat", "documents"])
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requirePermission } from "../auth/helpers";
import { PERMS } from "../workspace/permissions";

// Feature definitions with versions - centralized source of truth
export const FEATURE_DEFINITIONS = {
  "chat": {
    name: "Chat",
    slug: "chat", 
    type: "route" as const,
    icon: "MessageSquare",
    path: "/chat",
    component: "ChatPage",
    order: 2,
    version: "1.0.0",
    metadata: {
      description: "Messages and AI assistant",
      category: "communication",
    },
  },
  "calls": {
    name: "Calls",
    slug: "calls",
    type: "route" as const,
    icon: "Phone",
    path: "/calls",
    component: "CallsPage",
    order: 2.5,
    version: "1.0.0",
    metadata: {
      description: "Voice and video calls",
      category: "communication",
      featureType: "optional" as const,
    },
  },
  "status": {
    name: "Status",
    slug: "status",
    type: "route" as const,
    icon: "Camera",
    path: "/status",
    component: "StatusPage",
    order: 2.7,
    version: "1.0.0",
    metadata: {
      description: "Status updates and stories",
      category: "communication",
      featureType: "optional" as const,
    },
  },
  "documents": {
    name: "Documents",
    slug: "documents",
    type: "route" as const,
    icon: "FileText",
    path: "/documents",
    component: "DocumentsPage",
    order: 3,
    version: "1.2.0",
    metadata: {
      description: "Collaborative documents",
      category: "productivity",
    },
  },
  "builder": {
    name: "Builder",
    slug: "builder",
    type: "route" as const,
    icon: "Hammer",
    path: "/builder",
    component: "BuilderPage",
    order: 3.5,
    version: "1.0.0",
    metadata: {
      description: "Create content, automation, and interfaces with visual node canvas",
      category: "creativity",
      featureType: "optional" as const,
    },
  },
  "canvas": {
    name: "Canvas",
    slug: "canvas",
    type: "route" as const,
    icon: "Palette",
    path: "/canvas",
    component: "CanvasPage",
    order: 4,
    version: "1.0.0",
    metadata: {
      description: "Visual collaboration",
      category: "creativity",
    },
  },
  "members": {
    name: "Members",
    slug: "members",
    type: "route" as const,
    icon: "Users",
    path: "/members",
    component: "MembersPage",
    order: 5,
    version: "1.1.0",
    metadata: {
      description: "Manage workspace members",
      category: "administration",
    },
    requiresPermission: PERMS.MANAGE_MEMBERS,
  },
  "friends": {
    name: "Friends",
    slug: "friends",
    type: "route" as const,
    icon: "Heart",
    path: "/friends",
    component: "FriendsPage",
    order: 6,
    version: "1.0.0",
    metadata: {
      description: "Manage your friends",
      category: "social",
    },
  },
  "menus": {
    name: "Menu Store",
    slug: "menus",
    type: "route" as const,
    icon: "Menu",
    path: "/menus",
    component: "MenusPage",
    order: 10,
    version: "1.0.0",
    metadata: {
      description: "Install and manage navigation menus",
      category: "administration",
    },
    requiresPermission: PERMS.MANAGE_MENUS,
  },
  "invitations": {
    name: "Invitations",
    slug: "invitations",
    type: "route" as const,
    icon: "Mail",
    path: "/invitations",
    component: "InvitationsPage",
    order: 11,
    version: "1.0.0",
    metadata: {
      description: "Manage invitations",
      category: "administration",
    },
    requiresPermission: PERMS.MANAGE_INVITATIONS,
  },
} as const;

// Batch seed multiple features
export const seedMultipleFeatures = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.array(v.string()),
    forceUpdate: v.optional(v.boolean()),
  },
  returns: v.array(v.object({
    slug: v.string(),
    status: v.string(),
    message: v.optional(v.string()),
    menuItemId: v.optional(v.id("menuItems")),
    version: v.optional(v.string()),
    previousVersion: v.optional(v.string()),
    currentVersion: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);
    const userId = membership?.userId;

    const results = [];

    for (const featureSlug of args.featureSlugs) {
      const feature = FEATURE_DEFINITIONS[featureSlug as keyof typeof FEATURE_DEFINITIONS];
      if (!feature) {
        results.push({
          slug: featureSlug,
          status: "error",
          message: `Feature '${featureSlug}' not found in definitions`,
        });
        continue;
      }

      try {
        // Check if already exists
        const existing = await ctx.db
          .query("menuItems")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .filter((q) => q.eq(q.field("slug"), featureSlug))
          .first();

        if (existing && !args.forceUpdate) {
          results.push({
            slug: featureSlug,
            status: "skipped",
            message: "Already exists",
            currentVersion: existing.metadata?.version || "unknown",
          });
          continue;
        }

        if (existing && args.forceUpdate) {
          // Update existing
          await ctx.db.patch(existing._id, {
            name: feature.name,
            icon: feature.icon,
            path: feature.path,
            component: feature.component,
            order: feature.order,
            metadata: {
              ...existing.metadata,
              ...feature.metadata,
              version: feature.version,
              lastUpdated: Date.now(),
              previousVersion: existing.metadata?.version || "0.0.0",
            },
          });

          results.push({
            slug: featureSlug,
            status: "updated",
            menuItemId: existing._id,
            version: feature.version,
            previousVersion: existing.metadata?.version || "0.0.0",
          });
        } else {
          // Create new
          const menuItemId = await ctx.db.insert("menuItems", {
            workspaceId: args.workspaceId,
            name: feature.name,
            slug: feature.slug,
            type: feature.type,
            icon: feature.icon,
            path: feature.path,
            component: feature.component,
            order: feature.order,
            isVisible: true,
            visibleForRoleIds: [], // Default to visible for all roles
            metadata: {
              ...feature.metadata,
              version: feature.version,
              lastUpdated: Date.now(),
            },
            createdBy: userId,
          });

          results.push({
            slug: featureSlug,
            status: "created",
            menuItemId,
            version: feature.version,
          });
        }
      } catch (error) {
        results.push({
          slug: featureSlug,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

// Get feature status and versions for a workspace
export const getFeatureStatus = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.object({
    slug: v.string(),
    name: v.string(),
    definitionVersion: v.string(),
    installedVersion: v.union(v.string(), v.null()),
    isInstalled: v.boolean(),
    needsUpdate: v.boolean(),
    lastUpdated: v.union(v.number(), v.null()),
    menuItemId: v.union(v.id("menuItems"), v.null()),
  })),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);

    const installedMenus = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const installedMap = new Map(installedMenus.map(m => [m.slug, m]));

    const status = Object.entries(FEATURE_DEFINITIONS).map(([slug, definition]) => {
      const installed = installedMap.get(slug);
      
      return {
        slug,
        name: definition.name,
        definitionVersion: definition.version,
        installedVersion: installed?.metadata?.version || null,
        isInstalled: !!installed,
        needsUpdate: installed ? 
          (installed.metadata?.version || "0.0.0") !== definition.version : false,
        lastUpdated: installed?.metadata?.lastUpdated || null,
        menuItemId: installed?._id || null,
      };
    });

    return status;
  },
});

// Update a single feature to latest version
export const updateFeatureToLatest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlug: v.string(),
  },
  returns: v.object({
    slug: v.string(),
    status: v.string(),
    message: v.optional(v.string()),
    menuItemId: v.optional(v.id("menuItems")),
    version: v.optional(v.string()),
    previousVersion: v.optional(v.string()),
    currentVersion: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);
    const userId = membership?.userId;

    if (!userId) {
      throw new Error("User not found");
    }

    // Get the feature definition
    const featureDefinition = FEATURE_DEFINITIONS[args.featureSlug as keyof typeof FEATURE_DEFINITIONS];
    if (!featureDefinition) {
      return {
        slug: args.featureSlug,
        status: "error",
        message: `Feature '${args.featureSlug}' not found`,
      };
    }

    // Check if feature is already installed
    const existingMenuItem = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("slug"), args.featureSlug))
      .first();

    if (!existingMenuItem) {
      return {
        slug: args.featureSlug,
        status: "error",
        message: "Feature not installed, cannot update",
      };
    }

    const currentVersion = existingMenuItem.metadata?.version;
    const latestVersion = featureDefinition.version;

    if (currentVersion === latestVersion) {
      return {
        slug: args.featureSlug,
        status: "skipped",
        message: "Already at latest version",
        version: latestVersion,
        currentVersion: currentVersion,
      };
    }

    // Update the menu item
    await ctx.db.patch(existingMenuItem._id, {
      name: featureDefinition.name,
      type: featureDefinition.type,
      icon: featureDefinition.icon,
      path: featureDefinition.path,
      component: featureDefinition.component,
      order: featureDefinition.order,
      metadata: {
        ...existingMenuItem.metadata,
        ...featureDefinition.metadata,
        version: latestVersion,
        previousVersion: currentVersion,
        lastUpdated: Date.now(),
      },
      createdBy: userId,
    });

    return {
      slug: args.featureSlug,
      status: "updated",
      message: `Updated from v${currentVersion} to v${latestVersion}`,
      menuItemId: existingMenuItem._id,
      version: latestVersion,
      previousVersion: currentVersion,
      currentVersion: latestVersion,
    };
  },
});
