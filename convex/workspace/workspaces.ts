import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "../_generated/api";
import { resolveCandidateUserIds, hasPermission, ensureUser, requirePermission } from "../auth/helpers";
import type { Id } from "../_generated/dataModel";
import { PERMS } from "./permissions";
import { normalizeSlug } from "../lib/utils";

// Using shared helper from lib/auth

// Get user's workspaces
export const getUserWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const t0 = Date.now();
    // Collect all plausible user IDs for this identity to be resilient
    // against older data where multiple user docs might exist.
    const candidateIds: any[] = [];

    const authId = await getAuthUserId(ctx);
    if (authId) candidateIds.push(authId as any);

    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      console.log('[getUserWorkspaces] identity present');
      // Try linking via authAccounts (e.g. Clerk subject -> users.userId)
      try {
        const account = await ctx.db
          .query("authAccounts")
          .withIndex("providerAndAccountId", (q) =>
            q.eq("provider", "clerk").eq("providerAccountId", String(identity.subject))
          )
          .unique();
        if (account) candidateIds.push(account.userId as any);
      } catch (_err) {
        // ignore if table missing or not linked yet
      }
      if (identity.email) {
        const byEmail = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", identity.email!))
          .first();
        if (byEmail) candidateIds.push(byEmail._id as any);
      }
      const phone = (identity as any).phone as string | undefined;
      if (phone) {
        const byPhone = await ctx.db
          .query("users")
          .withIndex("phone", (q) => q.eq("phone", phone))
          .first();
        if (byPhone) candidateIds.push(byPhone._id as any);
      }
    }

    const uniqueIds = [...new Set(candidateIds.map(String))];
    if (uniqueIds.length === 0) return [] as any;

    // Gather active memberships for any of the candidate IDs
    const memberships: any[] = [];
    for (const idStr of uniqueIds) {
      const id = idStr as any;
      const ms = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user", (q) => q.eq("userId", id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      memberships.push(...ms);
    }

    // Load workspaces for memberships
    const itemsFromMemberships = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        if (!workspace) return null as any;
        const role = await ctx.db.get(membership.roleId);
        return { ...workspace, membership, role } as any;
      })
    ).then((arr) => arr.filter(Boolean));

    // Fallback: also include workspaces created by this user if any,
    // in case older data missed creating a membership.
    const byWorkspaceId: Record<string, any> = Object.create(null);
    for (const it of itemsFromMemberships) byWorkspaceId[String(it._id)] = it;

    let createdCount = 0;
    for (const idStr of uniqueIds) {
      const created = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", idStr as any))
        .collect();
      createdCount += created.length;
      for (const ws of created) {
        const key = String(ws._id);
        if (!(key in byWorkspaceId)) {
          byWorkspaceId[key] = { ...ws } as any;
        }
      }
    }

    const result = Object.values(byWorkspaceId).filter((w: any) => w && w.name);
    console.log('[getUserWorkspaces] summary', {
      candidateIds: uniqueIds.length,
      memberships: memberships.length,
      createdCount,
      resultCount: result.length,
      ms: Date.now() - t0,
    });
    return result;
  },
});

// Get workspace details
export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    // During initial auth hydration on the client, identity may be null.
    // Return null instead of throwing to avoid flashing errors.
    if (candidateIds.length === 0) return null as any;

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Check membership
    let membership: any = null;
    for (const idStr of candidateIds) {
      const m = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", idStr as any).eq("workspaceId", args.workspaceId)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .unique();
      if (m) {
        membership = m;
        break;
      }
    }

    if (!membership) {
      // Allow creators to access their own workspaces even if a membership doc is missing
      const isCreator = candidateIds.includes(String(workspace.createdBy));
      if (!isCreator) throw new Error("Not authorized");
    }

    const role = membership ? await ctx.db.get(membership.roleId) : null;

    return {
      ...workspace,
      membership,
      role,
    };
  },
});

// Get workspace members
export const getWorkspaceMembers = query({
  args: { 
    workspaceId: v.id("workspaces"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    // Return an empty list while auth is hydrating to prevent UI crashes
    if (candidateIds.length === 0) return [] as any;

    // Check if user is a member
    let userMembership: any = null;
    for (const idStr of candidateIds) {
      const m = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", idStr as any).eq("workspaceId", args.workspaceId)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .unique();
      if (m) {
        userMembership = m;
        break;
      }
    }

    // Determine viewer's level and whether creator fallback applies
    let viewerLevel: number | null = null;
    let creatorFallback = false;
    let viewerRoleDoc: any = null;
    if (userMembership) {
      viewerRoleDoc = await ctx.db.get(userMembership.roleId);
      viewerLevel = (viewerRoleDoc?.level as number | undefined) ?? (viewerRoleDoc?.permissions?.includes("*") ? 0 : null);
    } else {
      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace) throw new Error("Workspace not found");
      const isCreator = candidateIds.includes(String(workspace.createdBy));
      if (!isCreator) throw new Error("Not authorized");
      creatorFallback = true;
      viewerLevel = 0; // treat creator as Owner level
    }

    let memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    if (!args.includeInactive) {
      memberships = memberships.filter(m => m.status === "active");
    }

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        const role = await ctx.db.get(membership.roleId);
        let invitedBy = null;
        
        if (membership.invitedBy) {
          invitedBy = await ctx.db.get(membership.invitedBy);
        }

        return {
          ...membership,
          user,
          role,
          invitedBy,
          name: user?.name || "Unknown User",
          email: user?.email,
          image: user?.image,
        };
      })
    );

    // Visibility rule: All roles except Client can view members
    // and can see: their level (siblings), one level above (nearest), and all below.
    if (!creatorFallback && viewerRoleDoc?.slug === "client") {
      // Client cannot view members
      return [] as any;
    }

    const vLevel = viewerLevel ?? 0;
    // Determine immediate upper level present among members
    const levels = Array.from(new Set(members
      .map((m: any) => (m.role?.level as number | undefined))
      .filter((x: any) => typeof x === "number"))) as number[];
    const upperCandidates = levels.filter((lvl) => lvl < vLevel);
    const allowAbove = upperCandidates.length > 0 ? Math.max(...upperCandidates) : null;
    const filtered = members.filter((m: any) => {
      const tLevel = (m.role?.level as number | undefined);
      if (vLevel === 0) return true; // owner sees all
      if (tLevel === undefined) return true; // tolerate legacy roles without level
      if (tLevel === vLevel) return true; // siblings
      if (allowAbove !== null && tLevel === allowAbove) return true; // nearest one above
      if (tLevel > vLevel) return true; // all below
      return false;
    });

    return filtered.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  },
});

// Create workspace
export const createWorkspace = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("organization"),
      v.literal("institution"), 
      v.literal("group"),
      v.literal("family"),
      v.literal("personal")
    ),
    isPublic: v.boolean(),
    organizationId: v.optional(v.id("organizations")),
    // Allow user to pick which default menus to include (free selection)
    selectedMenuSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let maybeAuthUserId = await getAuthUserId(ctx);
    if (!maybeAuthUserId) {
      // Fallback to Clerk identity when using convex/react-clerk on the client
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
      // Pass through as a string so the code below creates or looks up a users doc
      maybeAuthUserId = identity.subject as any;
    }

    // Ensure we have a Convex Doc Id for the user (not a provider string)
    let userId = maybeAuthUserId as any;
    if (typeof userId === "string") {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");

      // Try to find existing user by email or phone
      let userDoc: any = null;
      // First: try linked auth account (e.g., Clerk subject -> users.userId)
      try {
        const account = await ctx.db
          .query("authAccounts")
          .withIndex("providerAndAccountId", (q) =>
            q.eq("provider", "clerk").eq("providerAccountId", String(identity.subject))
          )
          .unique();
        if (account) {
          userDoc = await ctx.db.get(account.userId);
        }
      } catch (_err) {
        // ignore if table missing or not linked yet
      }
      if (identity.email) {
        userDoc = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", identity.email!))
          .first();
      }
      if (!userDoc && (identity as any).phone) {
        userDoc = await ctx.db
          .query("users")
          .withIndex("phone", (q) => q.eq("phone", (identity as any).phone))
          .first();
      }

      if (userDoc) {
        userId = userDoc._id;
      } else {
        // Create a minimal users record
        userId = await ctx.db.insert("users", {
          name: identity.name ?? undefined,
          image: ((identity as any).pictureUrl ?? (identity as any).imageUrl) ?? undefined,
          email: identity.email ?? undefined,
          phone: (identity as any).phone ?? undefined,
          isAnonymous: false,
        } as any);
      }

      // Ensure we link this identity to the users doc for future lookups
      try {
        const existingAccount = await ctx.db
          .query("authAccounts")
          .withIndex("providerAndAccountId", (q) =>
            q.eq("provider", "clerk").eq("providerAccountId", String(identity.subject))
          )
          .unique();
        if (!existingAccount) {
          await ctx.db.insert("authAccounts", {
            userId,
            provider: "clerk",
            providerAccountId: String(identity.subject),
          } as any);
        }
      } catch (_err) {
        // best-effort linking
      }
    }

    // Ensure slug is unique (normalize and de-duplicate)
    const baseSlug = normalizeSlug(args.slug) || "workspace";
    let candidate = baseSlug;
    let n = 1;
    while (true) {
      const exists = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", candidate))
        .unique();
      if (!exists) break;
      n += 1;
      candidate = `${baseSlug}-${n}`;
    }
    const finalSlug = candidate;

    // Create workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug: finalSlug,
      description: args.description,
      type: args.type,
      organizationId: args.organizationId,
      isPublic: args.isPublic,
      settings: {
        allowInvites: true,
        requireApproval: false,
      },
      createdBy: userId,
    });

    // Create default hierarchical roles (owner -> guest)
    const ownerRoleId = await ctx.db.insert("roles", {
      name: "Owner",
      slug: "owner",
      description: "Workspace owner (super admin)",
      workspaceId,
      permissions: ["*"],
      color: "#111827",
      isDefault: false,
      isSystemRole: true,
      level: 0,
      createdBy: userId,
    });

    const adminRoleId = await ctx.db.insert("roles", {
      name: "Admin",
      slug: "admin",
      description: "Full access except system-level actions",
      workspaceId,
      permissions: [
        PERMS.MANAGE_WORKSPACE,
        PERMS.MANAGE_MEMBERS,
        PERMS.INVITE_MEMBERS,
        PERMS.MANAGE_ROLES,
        PERMS.MANAGE_MENUS,
        PERMS.DOCUMENTS_CREATE,
        PERMS.DOCUMENTS_EDIT,
        PERMS.DOCUMENTS_DELETE,
        PERMS.DOCUMENTS_MANAGE,
        PERMS.CREATE_CONVERSATIONS,
        PERMS.MANAGE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#dc2626",
      isDefault: false,
      isSystemRole: true,
      level: 10,
      createdBy: userId,
    });

    await ctx.db.insert("roles", {
      name: "Manager",
      slug: "manager",
      description: "Manage content and conversations",
      workspaceId,
      permissions: [
        PERMS.DOCUMENTS_CREATE,
        PERMS.DOCUMENTS_EDIT,
        PERMS.CREATE_CONVERSATIONS,
        PERMS.MANAGE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#2563eb",
      isDefault: false,
      isSystemRole: true,
      level: 30,
      createdBy: userId,
    });

    await ctx.db.insert("roles", {
      name: "Staff",
      slug: "staff",
      description: "Contribute content and chat",
      workspaceId,
      permissions: [
        PERMS.DOCUMENTS_CREATE,
        PERMS.DOCUMENTS_EDIT,
        PERMS.CREATE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#10b981",
      isDefault: false,
      isSystemRole: true,
      level: 50,
      createdBy: userId,
    });

    const clientRoleId = await ctx.db.insert("roles", {
      name: "Client",
      slug: "client",
      description: "Limited access; cannot view member list",
      workspaceId,
      permissions: [
        PERMS.CREATE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#6b7280",
      isDefault: true,
      isSystemRole: true,
      level: 70,
      createdBy: userId,
    });

    await ctx.db.insert("roles", {
      name: "Guest",
      slug: "guest",
      description: "Read-only viewer",
      workspaceId,
      permissions: [
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#9ca3af",
      isDefault: false,
      isSystemRole: true,
      level: 90,
      createdBy: userId,
    });

    // Add creator as owner
    await ctx.db.insert("workspaceMemberships", {
      workspaceId,
      userId,
      roleId: ownerRoleId,
      status: "active",
      joinedAt: Date.now(),
    });

    // Update workspace with default role (Client)
    await ctx.db.patch(workspaceId, {
      settings: {
        allowInvites: true,
        requireApproval: false,
        defaultRoleId: clientRoleId,
      },
    });

    // Create default menu items (best-effort; ignore auth failures in mixed auth setups)
    try {
      await ctx.runMutation(api.menu.menuItems.createDefaultMenuItems, { 
        workspaceId, 
        selectedSlugs: Array.isArray(args.selectedMenuSlugs) ? args.selectedMenuSlugs : [],
      });
    } catch (err) {
      console.warn("createDefaultMenuItems failed; continuing", err);
    }

    return workspaceId;
  },
});

// Update workspace
export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.workspaceId, updates);
    return args.workspaceId;
  },
});

// Join workspace by ID
export const joinWorkspaceById = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    inviteCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .unique();

    if (existingMembership) {
      if (existingMembership.status === "active") {
        throw new Error("You are already a member of this workspace");
      } else {
        // Reactivate membership
        await ctx.db.patch(existingMembership._id, {
          status: "active",
          joinedAt: Date.now(),
        });
        return args.workspaceId;
      }
    }

    // Check if workspace is public
    if (!workspace.isPublic) {
      throw new Error("This workspace is private and requires an invitation");
    }

    // Get default role
    const defaultRole = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    if (!defaultRole) {
      throw new Error("No default role found for this workspace");
    }

    // Add user to workspace
    await ctx.db.insert("workspaceMemberships", {
      workspaceId: args.workspaceId,
      userId,
      roleId: defaultRole._id,
      status: "active",
      joinedAt: Date.now(),
    });

    return args.workspaceId;
  },
});

// Update workspace member role
export const updateMemberRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    // Centralized permission check with creator fallback
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    // Get target membership
    const targetMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .unique();

    if (!targetMembership) throw new Error("Member not found");

    // Verify role belongs to workspace
    const newRole = await ctx.db.get(args.roleId);
    if (!newRole || newRole.workspaceId !== args.workspaceId) {
      throw new Error("Invalid role");
    }

    await ctx.db.patch(targetMembership._id, {
      roleId: args.roleId,
    });

    return targetMembership._id;
  },
});

// Add member to workspace (admin only)
export const addMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    roleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    // Centralized permission check with creator fallback
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    // Reactivate or no-op if membership exists
    const existing = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .unique();

    if (existing) {
      if (existing.status === "active") return existing._id;
      await ctx.db.patch(existing._id, {
        status: "active",
        joinedAt: Date.now(),
        roleId: args.roleId ?? existing.roleId,
        invitedBy: currentUserId,
      });
      return existing._id;
    }

    // Determine role: provided or default for workspace
    let roleId: Id<"roles">;
    if (args.roleId) {
      const role = await ctx.db.get(args.roleId);
      if (!role || role.workspaceId !== args.workspaceId) {
        throw new Error("Invalid role");
      }
      roleId = args.roleId;
    } else {
      const defaultRole = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
      if (!defaultRole) throw new Error("No default role found for this workspace");
      roleId = defaultRole._id as Id<"roles">;
    }

    const id = await ctx.db.insert("workspaceMemberships", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      roleId,
      status: "active",
      joinedAt: Date.now(),
      invitedBy: currentUserId,
    });
    return id;
  },
});

// Remove member from workspace
export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    // Centralized permission check with creator fallback
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    // Can't remove yourself if you're the only admin
    if (args.userId === currentUserId) {
      const adminMemberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      const adminCount = await Promise.all(
        adminMemberships.map(async (membership) => {
          const role = await ctx.db.get(membership.roleId);
          return role && hasPermission(role, PERMS.MANAGE_MEMBERS) ? 1 : 0;
        })
      ).then(counts => counts.reduce((sum: number, count: number) => sum + count, 0));

      if (adminCount <= 1) {
        throw new Error("Cannot remove the last admin from workspace");
      }
    }

    // Get target membership
    const targetMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .unique();

    if (!targetMembership) throw new Error("Member not found");

    await ctx.db.patch(targetMembership._id, {
      status: "inactive",
    });

    return targetMembership._id;
  },
});

// Leave workspace
export const leaveWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (!membership) throw new Error("Not a member of this workspace");

    // Check if user is the only admin
    const allMemberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const adminCount = await Promise.all(
      allMemberships.map(async (m) => {
        const role = await ctx.db.get(m.roleId);
        return role && hasPermission(role, PERMS.MANAGE_MEMBERS) ? 1 : 0;
      })
    ).then(counts => counts.reduce((sum: number, count: number) => sum + count, 0));

    const currentRole = await ctx.db.get(membership.roleId);
    if (currentRole && hasPermission(currentRole, PERMS.MANAGE_MEMBERS) && adminCount <= 1) {
      throw new Error("Cannot leave workspace as the last admin");
    }

    await ctx.db.patch(membership._id, {
      status: "inactive",
    });

    return membership._id;
  },
});

// Backfill memberships for workspaces created by the current user
export const backfillMembershipsForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Resolve or create a Convex users doc ID
    const userId = await ensureUser(ctx);

    // Find all workspaces created by this user
    const myWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    let added = 0;
    for (const ws of myWorkspaces) {
      const existing = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) => q.eq("userId", userId).eq("workspaceId", ws._id))
        .unique();
      if (existing) continue;

      // Get a default role (or any role)
      let defaultRole = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();

      let roleId = defaultRole?._id as any;
      if (!roleId) {
        const anyRole = await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .first();
        if (anyRole) {
          roleId = anyRole._id;
        } else {
          roleId = await ctx.db.insert("roles", {
            name: "Member",
            description: "Standard workspace access",
            workspaceId: ws._id,
            permissions: [PERMS.VIEW_WORKSPACE],
            color: "#2563eb",
            isDefault: true,
            createdBy: userId,
          } as any);
        }
      }

      await ctx.db.insert("workspaceMemberships", {
        workspaceId: ws._id,
        userId,
        roleId,
        status: "active",
        joinedAt: Date.now(),
      });
      added += 1;
    }
    const summary = { added } as any;
    console.log('[backfillMembershipsForCurrentUser] summary', summary);
    return summary;
  },
});

// Delete a workspace and related data (focused cleanup)
export const deleteWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const wsAssignments = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const a of wsAssignments) await ctx.db.delete(a._id);

    const ownedSets = await ctx.db
      .query("menuSets")
      .withIndex("by_ownerWorkspace", (q) => q.eq("ownerWorkspaceId", args.workspaceId))
      .collect();
    for (const set of ownedSets) {
      const items = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", set._id as any))
        .collect();
      for (const it of items) await ctx.db.delete(it._id);
      await ctx.db.delete(set._id);
    }

    const legacyItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const it of legacyItems) await ctx.db.delete(it._id);

    const roles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const role of roles) {
      const perms = await ctx.db
        .query("roleMenuPermissions")
        .withIndex("by_role", (q) => q.eq("roleId", role._id as any))
        .collect();
      for (const p of perms) await ctx.db.delete(p._id);
      await ctx.db.delete(role._id);
    }

    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const m of memberships) await ctx.db.delete(m._id);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const c of conversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", c._id as any))
        .collect();
      for (const msg of messages) {
        const reacts = await ctx.db
          .query("messageReactions")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id as any))
          .collect();
        for (const r of reacts) await ctx.db.delete(r._id);
        await ctx.db.delete(msg._id);
      }
      const parts = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation", (q) => q.eq("conversationId", c._id as any))
        .collect();
      for (const p of parts) await ctx.db.delete(p._id);
      await ctx.db.delete(c._id);
    }

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const d of docs) {
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_document", (q) => q.eq("documentId", d._id as any))
        .collect();
      for (const c of comments) await ctx.db.delete(c._id);
      const presence = await ctx.db
        .query("presence")
        .withIndex("by_document", (q) => q.eq("documentId", d._id as any))
        .collect();
      for (const pr of presence) await ctx.db.delete(pr._id);
      await ctx.db.delete(d._id);
    }

    const canvasEls = await ctx.db
      .query("canvasElements")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const el of canvasEls) await ctx.db.delete(el._id);
    const canvasPages = await ctx.db
      .query("canvasPages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const pg of canvasPages) await ctx.db.delete(pg._id);

    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const n of notifs) await ctx.db.delete(n._id);

    await ctx.db.delete(args.workspaceId);
    return true as const;
  },
});

// Reset (re-initialize) a workspace
export const resetWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    mode: v.union(v.literal("replaceMenus"), v.literal("clean")),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    let assignment = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
      .first();
    let menuSetId: any = assignment?.menuSetId ?? null;
    if (args.mode === "clean") {
      const ownedSets = await ctx.db
        .query("menuSets")
        .withIndex("by_ownerWorkspace", (q) => q.eq("ownerWorkspaceId", args.workspaceId))
        .collect();
      for (const set of ownedSets) {
        const items = await ctx.db
          .query("menuItems")
          .withIndex("by_menuSet", (q) => q.eq("menuSetId", set._id as any))
          .collect();
        for (const it of items) await ctx.db.delete(it._id);
        await ctx.db.delete(set._id);
      }
      const legacyItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
      for (const it of legacyItems) await ctx.db.delete(it._id);
      assignment = null;
      menuSetId = null;
    }

    if (!menuSetId) {
      menuSetId = await ctx.db.insert("menuSets", {
        ownerType: "workspace" as any,
        ownerWorkspaceId: args.workspaceId,
        name: "Default",
        slug: `default-${Date.now()}`,
        isPublic: true,
        createdBy: (await getAuthUserId(ctx)) as any,
      } as any);
      await ctx.db.insert("workspaceMenuAssignments", {
        workspaceId: args.workspaceId,
        menuSetId,
        isDefault: true,
        order: 0,
        createdAt: Date.now(),
      } as any);
    }

    const oldItems = await ctx.db
      .query("menuItems")
      .withIndex("by_menuSet", (q) => q.eq("menuSetId", menuSetId))
      .collect();
    for (const it of oldItems) await ctx.db.delete(it._id);

    await ctx.runMutation(api.menu.menuItems.createDefaultMenuItems, { workspaceId: args.workspaceId });
    return true as const;
  },
});
