import { internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { getUserByExternalId } from "../helpers";

/**
 * Create a new admin user from Clerk auth
 */
export const createAdminUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    // Initial role level (defaults to highest non-owner level if not specified)
    roleLevel: v.optional(v.number()),
  },
  returns: v.object({
    userId: v.id("adminUsers"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if user already exists
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      throw new ConvexError("User already exists");
    }

    // Default to Admin role level (10) if not specified
    const roleLevel = args.roleLevel ?? 10;

    // Get the role to validate and get permissions
    const role = await ctx.db
      .query("roles")
      .withIndex("by_level", (q) => q.eq("level", roleLevel))
      .unique();

    if (!role) {
      throw new ConvexError("Invalid role level");
    }

    // Ensure the role document has a numeric level before using it.
    if (role.level == null) {
      throw new ConvexError("Role must have a numeric level");
    }

    // Create the admin user
    const userId = await ctx.db.insert("adminUsers", {
      clerkId: identity.subject,
      email: args.email,
      name: args.name,
      roleLevel: role.level,
      permissions: role.permissions,
      status: "active",
      workspaceIds: [],
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    return { userId };
  },
});

/**
 * Add a user to a workspace
 */
export const addToWorkspace = internalMutation({
  args: {
    userId: v.id("adminUsers"),
    workspaceId: v.string(),
    roleLevel: v.number(),
    additionalPermissions: v.optional(v.array(v.string())),
  },
  returns: v.object({
    membershipId: v.id("workspaceMemberships"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const db = ctx.db;

    const adminUser = await db.get(args.userId);
    if (!adminUser) {
      throw new ConvexError("User not found");
    }

    const workspaceId = db.normalizeId("workspaces", args.workspaceId);
    if (!workspaceId) {
      throw new ConvexError("Invalid workspace id");
    }

    const targetUser = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", adminUser.clerkId))
      .unique();

    if (!targetUser) {
      throw new ConvexError("Linked user record not found");
    }

    const existing = await db
      .query("workspaceMemberships")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", targetUser._id),
      )
      .unique();

    if (existing) {
      throw new ConvexError("User is already a member of this workspace");
    }

    const role = await db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("level"), args.roleLevel))
      .unique();

    if (!role) {
      throw new ConvexError("Role not found for workspace");
    }

    const actorUser =
      (await getUserByExternalId(ctx, identity.subject)) ?? null;
    const actorUserId = actorUser?._id;

    const membershipId = await db.insert("workspaceMemberships", {
      userId: targetUser._id,
      workspaceId,
      roleId: role._id,
      roleLevel: role.level ?? args.roleLevel,
      additionalPermissions: args.additionalPermissions ?? [],
      status: "active",
      joinedAt: Date.now(),
      invitedBy: actorUserId ?? undefined,
      createdBy: actorUserId ?? undefined,
      updatedBy: actorUserId ?? undefined,
    });

    const workspaceSet = new Set<string>(adminUser.workspaceIds);
    workspaceSet.add(args.workspaceId);

    await db.patch(args.userId, {
      workspaceIds: Array.from(workspaceSet),
      updatedBy: identity.subject,
    });

    return { membershipId };
  },
});

/**
 * Update a user's workspace role
 */
export const updateWorkspaceRole = internalMutation({
  args: {
    membershipId: v.id("workspaceMemberships"),
    roleLevel: v.number(),
    additionalPermissions: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new ConvexError("Membership not found");
    }

    const role = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) =>
        q.eq("workspaceId", membership.workspaceId),
      )
      .filter((q) => q.eq(q.field("level"), args.roleLevel))
      .unique();

    if (!role) {
      throw new ConvexError("Role not found for workspace");
    }

    const actorUser =
      (await getUserByExternalId(ctx, identity.subject)) ?? null;

    // Update the membership
    await ctx.db.patch(args.membershipId, {
      roleId: role._id,
      roleLevel: role.level ?? args.roleLevel,
      additionalPermissions:
        args.additionalPermissions ?? membership.additionalPermissions,
      updatedBy: actorUser?._id ?? undefined,
    });

    return null;
  },
});

/**
 * Initialize current user as admin (self-service for development)
 * This creates an admin user record for workspace owners
 * If the user has no workspace, creates a default personal workspace for them
 */
export const initializeCurrentUserAsAdmin = internalMutation({
  args: {},
  returns: v.object({
    userId: v.id("adminUsers"),
    created: v.boolean(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required");
    }

    // Check if admin user already exists
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      return { userId: existing._id, created: false };
    }

    // Get or create the user from users table
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // If user doesn't exist, create it
    if (!user) {
      console.log(`[initializeCurrentUserAsAdmin] Creating user record for ${identity.subject}`);
      const email = (identity.email ?? identity.emailVerified ?? "no-email@example.com") as string;
      const name = (identity.name ?? identity.nickname ?? "User") as string;
      
      const userId = await ctx.db.insert("users", {
        email,
        name,
        clerkId: identity.subject,
        status: "active",
      });
      
      const createdUser = await ctx.db.get(userId);
      if (!createdUser) {
        throw new ConvexError("Failed to create user record");
      }
      user = createdUser;
    }

    // At this point, user is guaranteed to be non-null
    const guaranteedUser = user;

    // Check if user has any workspace membership
    let ownerMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", guaranteedUser._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    // Check if the membership has owner role level (either directly or via role)
    let isOwner = false;
    if (ownerMembership) {
      // Check roleLevel directly if it exists
      if (ownerMembership.roleLevel === 0) {
        isOwner = true;
      } else {
        // Fall back to checking the role document
        const role = await ctx.db.get(ownerMembership.roleId);
        if (role && role.level === 0) {
          isOwner = true;
          // Update membership with roleLevel for future queries
          await ctx.db.patch(ownerMembership._id, {
            roleLevel: 0,
          });
        }
      }
    }

    // If user has no workspace or is not an owner, create Main Workspace
    if (!ownerMembership || !isOwner) {
      if (ownerMembership && !isOwner) {
        console.log(`[initializeCurrentUserAsAdmin] User has workspace but is not owner, creating Main Workspace`);
      } else {
        console.log(`[initializeCurrentUserAsAdmin] Creating Main Workspace for user ${guaranteedUser.email}`);
      }
      
      const name = (identity.name ?? identity.nickname ?? guaranteedUser.name ?? "User") as string;
      const userName = name.split(" ")[0] || "My";
      
      // Create Main Workspace via hierarchy mutation
      // This is the user's personal hub workspace with special settings
      const workspaceId = await ctx.runMutation(
        internal.workspace.hierarchy.createMainWorkspace,
        {
          userId: guaranteedUser._id,
          userName,
        }
      );

      console.log(`[initializeCurrentUserAsAdmin] Created workspace ${workspaceId} for user ${guaranteedUser.email}`);
      
      // Mark as owner since we just created the workspace
      isOwner = true;
      
      // Refresh membership query
      ownerMembership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user", (q) => q.eq("userId", guaranteedUser._id))
        .filter((q) => q.eq(q.field("roleLevel"), 0))
        .first();
    }

    // Verify we have owner status
    if (!isOwner) {
      throw new ConvexError("CMS access requires workspace owner role. Only workspace owners can access the CMS.");
    }

    // User is a workspace owner, create admin record
    const email = (identity.email ?? identity.emailVerified ?? guaranteedUser.email ?? "no-email@example.com") as string;
    const name = (identity.name ?? identity.nickname ?? guaranteedUser.name ?? "User") as string;

    // Get all workspace IDs where user is owner
    const ownerMemberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", guaranteedUser._id))
      .filter((q) => q.eq(q.field("roleLevel"), 0))
      .collect();

    const workspaceIds = ownerMemberships.map(m => m.workspaceId);

    // Create admin user with owner-level permissions
    const adminUserId = await ctx.db.insert("adminUsers", {
      clerkId: identity.subject,
      email,
      name,
      roleLevel: 0, // Owner level (matches workspace owner role)
      permissions: ["*"], // All permissions for workspace owners
      status: "active",
      workspaceIds,
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    console.log(`[initializeCurrentUserAsAdmin] Created admin user ${adminUserId} for workspace owner ${email}`);

    return { userId: adminUserId, created: true };
  },
});
