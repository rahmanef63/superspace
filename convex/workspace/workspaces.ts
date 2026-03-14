import { v } from "convex/values"
import { query, mutation } from "../_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { api, internal } from "../_generated/api"
import { resolveCandidateUserIds, hasPermission, ensureUser, requirePermission, getUserByExternalId } from "../auth/helpers"
import type { Doc, Id } from "../_generated/dataModel"
import { PERMS } from "./permissions"
import { ensureSystemRoles } from "./roles"
import { normalizeSlug } from "../lib/utils"

// Helper to get Convex user ID from auth context (for queries)
async function getConvexUserId(ctx: any): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null

  // Try by clerkId first
  const user = await getUserByExternalId(ctx, identity.subject)
  if (user) return user._id

  // Fallback: try by email
  if (identity.email) {
    const byEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", identity.email))
      .first()
    if (byEmail) return byEmail._id
  }

  return null
}

// Get user's workspaces
export const getUserWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = await getConvexUserId(ctx)
    const clerkId = identity.subject // Clerk ID like "user_32Na..."

    // Collect workspace IDs from multiple sources
    const workspaceIds = new Set<Id<"workspaces">>()

    // 1. Get workspaces from memberships (if we have a Convex userId)
    if (userId) {
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()

      for (const m of memberships) {
        workspaceIds.add(m.workspaceId)
      }
    }

    // 2. Get workspaces created by this user (by Convex userId)
    if (userId) {
      const createdByUserId = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", userId))
        .collect()

      for (const w of createdByUserId) {
        workspaceIds.add(w._id)
      }
    }

    // 3. Get workspaces created with Clerk ID as createdBy (legacy)
    if (clerkId) {
      const createdByClerkId = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", clerkId as any))
        .collect()

      for (const w of createdByClerkId) {
        workspaceIds.add(w._id)
      }
    }

    // Get all unique workspaces
    const workspaces = await Promise.all(
      Array.from(workspaceIds).map((id) => ctx.db.get(id))
    )

    // Filter nulls (in case of dangling references) and return
    return workspaces.filter(
      (w): w is Doc<"workspaces"> => w !== null && w.isDeleted !== true,
    )
  },
})

// Get a specific workspace by ID
export const getWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getConvexUserId(ctx)
    if (!userId) return null

    // Check membership
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .first()

    if (!membership || membership.status !== "active") {
      return null
    }

    return await ctx.db.get(args.workspaceId)
  },
})

// Get workspace members
export const getWorkspaceMembers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getConvexUserId(ctx)
    if (!userId) return []

    // Check existence of workspace and user's membership
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .first()

    if (!membership || membership.status !== "active") {
      return []
    }

    // Get all memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return memberships
  },
})

export const deleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")

    // Check permissions
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    // Soft delete to prevent orphaned data
    const recoveryDays = 30;
    const recoveryExpiresAt = Date.now() + recoveryDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.workspaceId, {
      isDeleted: true,
      deletedAt: Date.now(),
      deletedBy: userId,
      recoveryExpiresAt,
    })

    // Log audit event
    const workspace = await ctx.db.get(args.workspaceId);
    if (workspace) {
      await ctx.db.insert("activityEvents", {
        actorUserId: userId,
        workspaceId: args.workspaceId,
        entityType: "workspace",
        entityId: String(args.workspaceId),
        action: "workspace_soft_deleted",
        diff: {
          workspaceName: workspace.name,
          recoveryExpiresAt,
          recoveryDays,
        },
        createdAt: Date.now(),
      });
    }
  },
})

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()), // Optional, generated if not provided
    type: v.optional(v.string()), // business, personal, etc.
    // Extended args from onbording flow
    bundleId: v.optional(v.string()),
    description: v.optional(v.string()),
    enabledFeatures: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    selectedMenuSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")

    // 1. Create Workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug: args.slug || normalizeSlug(args.name),
      type: (args.type as any) || "personal", // Cast as any if union type doesn't match string (schema strictness)
      description: args.description,
      isPublic: args.isPublic ?? false,
      createdBy: userId, // Match schema (was ownerId)
      settings: {
        bundleId: args.bundleId,
        enabledFeatures: args.enabledFeatures,
      },
      // Schema requires fields?
      // createdAt/updatedAt are NOT in schema definition if not defined, but Convex handles _creationTime. 
      // Schema definition in core/api/schema.ts DOES NOT include createdAt/updatedAt manually. 
      // If I add them, strict schema might reject them if not defined.
      // Checking schema again: it does NOT have createdAt/updatedAt.
    })

    // 2. Create System Roles (Owner, Admin, Member, Guest)
    const { ordered: roles } = await ensureSystemRoles(ctx, workspaceId, userId)
    const ownerRole = roles.find(r => r.name === "Owner")

    if (!ownerRole) throw new Error("Failed to create system roles")

    // 3. Add Creator as Owner
    await ctx.db.insert("workspaceMemberships", {
      workspaceId,
      userId,
      roleId: ownerRole._id,
      status: "active",
      joinedAt: Date.now(),
      additionalPermissions: [], // Schema requires this? 
      // Checking schema: additionalPermissions: v.array(v.string()) IS REQUIRED.
    })

    return workspaceId
  },
})

export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    themePreset: v.optional(v.string()),
    shareDataToParent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")

    // Check permissions
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    const { workspaceId, ...updates } = args

    // Filter out undefined values
    const patch: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value
      }
    }

    await ctx.db.patch(workspaceId, patch)
  },
})

export const backfillMembershipsForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx)
    if (!userId) return { added: 0, found: 0 }

    // Get the identity to also search by Clerk ID (for legacy workspaces)
    const identity = await ctx.auth.getUserIdentity()
    const clerkId = identity?.subject

    // Find all workspaces created by user (by Convex userId)
    const workspacesByUserId = await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect()

    // Also find workspaces created with Clerk ID as createdBy (legacy)
    const workspacesByClerkId = clerkId
      ? await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", clerkId as any))
        .collect()
      : []

    // Merge and deduplicate
    const workspaceIds = new Set<string>()
    const workspaces = [...workspacesByUserId, ...workspacesByClerkId].filter(w => {
      if (workspaceIds.has(w._id)) return false
      workspaceIds.add(w._id)
      return true
    })

    let added = 0;

    for (const workspace of workspaces) {
      // Check if membership exists
      const membership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", userId).eq("workspaceId", workspace._id)
        )
        .first()

      if (!membership) {
        // Create Owner role if missing (lazy fix)
        const { ordered: roles } = await ensureSystemRoles(ctx, workspace._id, userId)
        const ownerRole = roles.find(r => r.name === "Owner")

        if (ownerRole) {
          await ctx.db.insert("workspaceMemberships", {
            workspaceId: workspace._id,
            userId,
            roleId: ownerRole._id,
            status: "active",
            joinedAt: Date.now(),
            additionalPermissions: [], // Required by schema
          })
          added++;
        }
      }
    }

    return { added, found: workspaces.length };
  }
})

export const resetWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    mode: v.union(v.literal("replaceMenus"), v.literal("clean")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Unauthenticated")

    // Check permissions
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

    if (args.mode === "clean") {
      // TODO: Implement clean reset
      // This would involve deleting all data but keeping the workspace doc
      // console.log("Clean reset requested for workspace", args.workspaceId)
    } else if (args.mode === "replaceMenus") {
      // TODO: Implement menu reset
      // This would involve resetting menus to default
      // console.log("Menu reset requested for workspace", args.workspaceId)
    }
  },
})

/**
 * Get all members of a workspace with user and role details.
 */
export const getMembers = query({
  args: {
    workspaceId: v.id("workspaces"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify membership (reader access)
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .first();

    if (!membership || membership.status !== "active") return [];

    let membersQuery = ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    // Note: Filtering by status in memory if not using index
    const memberships = await membersQuery.collect();

    const results = await Promise.all(
      memberships.map(async (m) => {
        if (!args.includeInactive && m.status !== "active") return null;

        const user = await ctx.db.get(m.userId);
        const role = await ctx.db.get(m.roleId);

        if (!user) return null; // Should not happen for valid members

        return {
          ...m,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          role: role ? {
            _id: role._id,
            name: role.name,
            color: role.color,
            level: role.level,
          } : null,
        };
      })
    );

    return results.filter((m) => m !== null);
  },
});

/**
 * Remove a member from a workspace.
 */
export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .first();

    if (!membership) throw new Error("Member not found");

    await ctx.db.delete(membership._id);

    // TODO: Audit log
  },
});

/**
 * Add a user to a workspace with a specific role.
 * Creates a new active membership record.
 */
export const addMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    // Check for existing membership
    const existing = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .first();

    if (existing) throw new Error("User is already a member of this workspace");

    await ctx.db.insert("workspaceMemberships", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      roleId: args.roleId,
      status: "active",
      invitedBy: currentUserId,
      joinedAt: Date.now(),
      additionalPermissions: [],
    });
  },
});

/**
 * Update a member's role.
 */
export const updateMemberRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .first();

    if (!membership) throw new Error("Member not found");

    await ctx.db.patch(membership._id, { roleId: args.roleId });

    // TODO: Audit log
  },
});

// ============================================================================
// Clone, Archive, Soft Delete & Recovery
// ============================================================================

/**
 * Clone an existing workspace (deep copy)
 * Creates a new workspace with the same settings, roles, and optionally data
 */
export const cloneWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    // Clone options
    includeRoles: v.optional(v.boolean()),
    includeSettings: v.optional(v.boolean()),
    parentWorkspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Unauthenticated");

    // Check permission to view source workspace
    await requirePermission(ctx, args.workspaceId, PERMS.VIEW_WORKSPACE);

    const sourceWorkspace = await ctx.db.get(args.workspaceId);
    if (!sourceWorkspace) throw new Error("Source workspace not found");

    const slug = args.slug || normalizeSlug(args.name);
    const includeRoles = args.includeRoles ?? true;
    const includeSettings = args.includeSettings ?? true;

    // Create cloned workspace
    const clonedWorkspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug,
      description: args.description ?? sourceWorkspace.description,
      type: sourceWorkspace.type,
      isPublic: false, // Clones start as private
      timezone: sourceWorkspace.timezone,
      language: sourceWorkspace.language,
      icon: sourceWorkspace.icon,
      color: sourceWorkspace.color,
      themePreset: sourceWorkspace.themePreset,
      parentWorkspaceId: args.parentWorkspaceId,
      clonedFromId: args.workspaceId,
      settings: includeSettings ? sourceWorkspace.settings : undefined,
      createdBy: userId,
    });

    // Create system roles
    const { ordered: systemRoles, map: roleMap } = await (await import("./roles")).ensureSystemRoles(
      ctx,
      clonedWorkspaceId,
      userId
    );

    // Clone custom roles if requested
    if (includeRoles) {
      const sourceRoles = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();

      for (const role of sourceRoles) {
        // Skip system roles (already created)
        if (role.isSystemRole) continue;

        await ctx.db.insert("roles", {
          name: role.name,
          slug: role.slug,
          description: role.description,
          workspaceId: clonedWorkspaceId,
          permissions: role.permissions,
          color: role.color,
          isDefault: role.isDefault,
          isSystemRole: false,
          level: role.level,
          createdBy: userId,
        });
      }
    }

    // Add creator as Owner
    const ownerRole = roleMap.get("owner");
    if (ownerRole) {
      await ctx.db.insert("workspaceMemberships", {
        workspaceId: clonedWorkspaceId,
        userId,
        roleId: ownerRole._id,
        status: "active",
        joinedAt: Date.now(),
        additionalPermissions: [],
      });
    }

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: clonedWorkspaceId,
      entityType: "workspace",
      entityId: String(clonedWorkspaceId),
      action: "workspace_cloned",
      diff: {
        sourceWorkspaceId: args.workspaceId,
        sourceWorkspaceName: sourceWorkspace.name
      },
      createdAt: Date.now(),
    });

    return clonedWorkspaceId;
  },
});

/**
 * Archive a workspace (hide from active list but preserve data)
 */
export const archiveWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.isArchived) {
      throw new Error("Workspace is already archived");
    }

    await ctx.db.patch(args.workspaceId, {
      isArchived: true,
      archivedAt: Date.now(),
      archivedBy: userId,
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace",
      entityId: String(args.workspaceId),
      action: "workspace_archived",
      diff: { workspaceName: workspace.name },
      createdAt: Date.now(),
    });

    return true;
  },
});

/**
 * Unarchive a workspace (restore to active list)
 */
export const unarchiveWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (!workspace.isArchived) {
      throw new Error("Workspace is not archived");
    }

    await ctx.db.patch(args.workspaceId, {
      isArchived: false,
      archivedAt: undefined,
      archivedBy: undefined,
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace",
      entityId: String(args.workspaceId),
      action: "workspace_unarchived",
      diff: { workspaceName: workspace.name },
      createdAt: Date.now(),
    });

    return true;
  },
});

/**
 * Soft delete a workspace (mark for deletion with recovery period)
 * Default recovery period: 30 days
 */
export const softDeleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    recoveryDays: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.isDeleted) {
      throw new Error("Workspace is already deleted");
    }

    const recoveryDays = args.recoveryDays ?? 30;
    const recoveryExpiresAt = Date.now() + recoveryDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.workspaceId, {
      isDeleted: true,
      deletedAt: Date.now(),
      deletedBy: userId,
      recoveryExpiresAt,
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace",
      entityId: String(args.workspaceId),
      action: "workspace_soft_deleted",
      diff: {
        workspaceName: workspace.name,
        recoveryExpiresAt,
        recoveryDays,
      },
      createdAt: Date.now(),
    });

    return true;
  },
});

/**
 * Recover a soft-deleted workspace (before recovery period expires)
 */
export const recoverWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (!workspace.isDeleted) {
      throw new Error("Workspace is not deleted");
    }

    // Check if recovery period has expired
    if (workspace.recoveryExpiresAt && Date.now() > workspace.recoveryExpiresAt) {
      throw new Error("Recovery period has expired. Workspace cannot be recovered.");
    }

    // Only the original deleter or workspace owner can recover
    // Check membership for owner role
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .first();

    if (!membership) {
      throw new Error("You do not have permission to recover this workspace");
    }

    await ctx.db.patch(args.workspaceId, {
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      recoveryExpiresAt: undefined,
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace",
      entityId: String(args.workspaceId),
      action: "workspace_recovered",
      diff: { workspaceName: workspace.name },
      createdAt: Date.now(),
    });

    return true;
  },
});

/**
 * Permanently delete a workspace (only after recovery period expires)
 * This is a destructive action with cascade delete
 */
export const permanentlyDeleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    confirmationPhrase: v.string(), // Require typing workspace name
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Unauthenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Require confirmation phrase to match workspace name
    if (args.confirmationPhrase !== workspace.name) {
      throw new Error("Confirmation phrase does not match workspace name");
    }

    // Only allow permanent deletion after soft-delete and recovery expiry
    if (!workspace.isDeleted) {
      throw new Error("Workspace must be soft-deleted first. Use softDeleteWorkspace.");
    }

    if (workspace.recoveryExpiresAt && Date.now() < workspace.recoveryExpiresAt) {
      const daysRemaining = Math.ceil(
        (workspace.recoveryExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)
      );
      throw new Error(
        `Recovery period has not expired. ${daysRemaining} days remaining.`
      );
    }

    // Cascade delete all related data
    // 1. Delete memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const m of memberships) {
      await ctx.db.delete(m._id);
    }

    // 2. Delete roles
    const roles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const r of roles) {
      await ctx.db.delete(r._id);
    }

    // 3. Delete invitations
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const i of invitations) {
      await ctx.db.delete(i._id);
    }

    // 4. Delete workspace links
    const parentLinks = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.workspaceId))
      .collect();
    for (const l of parentLinks) {
      await ctx.db.delete(l._id);
    }

    const childLinks = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_child", (q) => q.eq("childWorkspaceId", args.workspaceId))
      .collect();
    for (const l of childLinks) {
      await ctx.db.delete(l._id);
    }

    // 5. Delete activity events (optional - could archive instead)
    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const e of events) {
      await ctx.db.delete(e._id);
    }

    // Finally, delete the workspace
    await ctx.db.delete(args.workspaceId);

    return true;
  },
});

/**
 * Get archived workspaces for current user
 */
export const getArchivedWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = await getConvexUserId(ctx);
    if (!userId) return [];

    // Get memberships for archived workspaces
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = await Promise.all(
      memberships.map(async (m) => {
        const ws = await ctx.db.get(m.workspaceId);
        if (ws && ws.isArchived && !ws.isDeleted) {
          return ws;
        }
        return null;
      })
    );

    return workspaces.filter(Boolean);
  },
});

/**
 * Get soft-deleted workspaces for current user (within recovery period)
 */
export const getDeletedWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = await getConvexUserId(ctx);
    if (!userId) return [];

    // Get memberships for deleted workspaces
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = await Promise.all(
      memberships.map(async (m) => {
        const ws = await ctx.db.get(m.workspaceId);
        if (ws && ws.isDeleted) {
          // Check if still within recovery period
          const isRecoverable =
            !ws.recoveryExpiresAt || Date.now() < ws.recoveryExpiresAt;
          return { ...ws, isRecoverable };
        }
        return null;
      })
    );

    return workspaces.filter(Boolean);
  },
});

/**
 * Migration: Upgrade workspace creators from Admin to Owner
 */
export const migrateCreatorsToOwner = mutation({
  args: {},
  handler: async (ctx) => {
    const workspaces = await ctx.db.query("workspaces").collect();
    let migratedCount = 0;

    for (const workspace of workspaces) {
      if (!workspace.createdBy) continue;

      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect();

      if (memberships.length === 0) continue;

      // Ensure system roles (Admin, Owner, etc.)
      const firstUserId = memberships[0].userId;
      const { map: roleMap } = await ensureSystemRoles(ctx, workspace._id, firstUserId);
      const ownerRole = roleMap.get("owner");
      if (!ownerRole) continue;

      // Check if there's already an Owner
      const hasOwner = memberships.some(m => m.roleId === ownerRole._id);
      if (hasOwner) continue;

      // Try to find creator's membership, or fallback to first Admin
      let targetMembership = memberships.find(m => m.userId === workspace.createdBy);
      if (!targetMembership) {
        const adminRole = roleMap.get("admin");
        if (adminRole) {
          targetMembership = memberships.find(m => m.roleId === adminRole._id);
        }
      }

      if (targetMembership) {
        await ctx.db.patch(targetMembership._id, { roleId: ownerRole._id });
        migratedCount++;
      }
    }

    return { migratedCount };
  },
});
