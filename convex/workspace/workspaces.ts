// @ts-nocheck - Bypass type checking due to Convex generated API type instantiation depth limits
import { v } from "convex/values"
import { query, mutation } from "../_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { api, internal } from "../_generated/api"
import { resolveCandidateUserIds, hasPermission, ensureUser, requirePermission, getUserByExternalId } from "../auth/helpers"
import type { Id } from "../_generated/dataModel"
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
    const workspaceIds = new Set<string>()

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
      Array.from(workspaceIds).map((id) => ctx.db.get(id as any))
    )

    // Filter nulls (in case of dangling references) and return
    return workspaces.filter((w): w is NonNullable<typeof w> => w !== null)
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

    // 1. Delete memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    for (const membership of memberships) {
      await ctx.db.delete(membership._id)
    }

    // 2. Delete workspace
    await ctx.db.delete(args.workspaceId)

    // TODO: Cascade delete other resources (projects, docs, etc.)
    // This requires a more comprehensive cleanup strategy
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

    // 2. Create System Roles (Admin, Member, Guest)
    const { ordered: roles } = await ensureSystemRoles(ctx, workspaceId, userId)
    const adminRole = roles.find(r => r.name === "Admin")

    if (!adminRole) throw new Error("Failed to create system roles")

    // 3. Add Creator as Admin
    await ctx.db.insert("workspaceMemberships", {
      workspaceId,
      userId,
      roleId: adminRole._id,
      status: "active",
      joinedAt: Date.now(),
      additionalPermissions: [], // Schema requires this? 
      // Checking schema: additionalPermissions: v.array(v.string()) IS REQUIRED.
    })

    return workspaceId
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
        // Create Admin role if missing (lazy fix)
        const { ordered: roles } = await ensureSystemRoles(ctx, workspace._id, userId)
        const adminRole = roles.find(r => r.name === "Admin")

        if (adminRole) {
          await ctx.db.insert("workspaceMemberships", {
            workspaceId: workspace._id,
            userId,
            roleId: adminRole._id,
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
