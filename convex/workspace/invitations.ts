import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, requireActiveMembership, hasPermission, canPermission } from "../auth/helpers";
import { PERMS } from "./permissions";

// Generate unique invitation token
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Send workspace invitation
export const sendWorkspaceInvitation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    inviteeEmail: v.string(),
    roleId: v.id("roles"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check permission via membership helper
    const { membership, role } = await requireActiveMembership(ctx, args.workspaceId);
    if (!membership && !role) throw new Error("Not authorized");
    if (!hasPermission(role, "invite_members")) throw new Error("Insufficient permissions");

    // Check if user is already a member or has pending invitation
    const existingMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Find user by email
    const inviteeUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.inviteeEmail))
      .unique();

    if (inviteeUser) {
      const existingMember = existingMembership.find(m => m.userId === inviteeUser._id);
      if (existingMember && existingMember.status === "active") {
        throw new Error("User is already a member of this workspace");
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_invitee_email", (q) => q.eq("inviteeEmail", args.inviteeEmail))
      .filter((q) => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.eq(q.field("status"), "pending")
        )
      )
      .unique();

    if (existingInvitation) {
      throw new Error("Invitation already sent to this email");
    }

    const token = generateInvitationToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const invitationId = await ctx.db.insert("invitations", {
      type: "workspace",
      workspaceId: args.workspaceId,
      inviterId: currentUserId,
      inviteeEmail: args.inviteeEmail,
      inviteeId: inviteeUser?._id,
      roleId: args.roleId,
      status: "pending",
      message: args.message,
      expiresAt,
      token,
    });

    return { invitationId, token };
  },
});

// List workspace invitations (management view)
export const getWorkspaceInvitations = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
    )),
  },
  handler: async (ctx, args) => {
    // Soft-guard: if not allowed, return empty list instead of throwing to keep UI stable
    const allowed = await canPermission(ctx, args.workspaceId, PERMS.INVITE_MEMBERS);
    if (!allowed) return [] as any[];

    let invitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    if (args.status) {
      invitations = invitations.filter((i) => i.status === args.status);
    }

    // hydrate inviter, role
    const enriched = await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await ctx.db.get(inv.inviterId);
        const role = inv.roleId ? await ctx.db.get(inv.roleId) : null;
        return { ...inv, inviter, role } as any;
      })
    );

    return enriched;
  },
});

// Send personal invitation (friend request)
export const sendPersonalInvitation = mutation({
  args: {
    inviteeEmail: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if user exists
    const inviteeUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.inviteeEmail))
      .unique();

    // Check for existing invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_invitee_email", (q) => q.eq("inviteeEmail", args.inviteeEmail))
      .filter((q) => 
        q.and(
          q.eq(q.field("inviterId"), currentUserId),
          q.eq(q.field("type"), "personal"),
          q.eq(q.field("status"), "pending")
        )
      )
      .unique();

    if (existingInvitation) {
      throw new Error("Invitation already sent to this email");
    }

    const token = generateInvitationToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    const invitationId = await ctx.db.insert("invitations", {
      type: "personal",
      inviterId: currentUserId,
      inviteeEmail: args.inviteeEmail,
      inviteeId: inviteeUser?._id,
      status: "pending",
      message: args.message,
      expiresAt,
      token,
    });

    return { invitationId, token };
  },
});

// Get user's invitations (sent and received)
export const getUserInvitations = query({
  args: {
    type: v.optional(v.union(v.literal("sent"), v.literal("received"))),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    )),
    kind: v.optional(v.union(v.literal("workspace"), v.literal("personal"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [] as any;

    const inviteeEmail = identity.email ?? null;
    let invitations: any[] = [];

    // Try to find current user by email (most reliable for Clerk auth)
    let currentUserId: any = null;
    if (inviteeEmail) {
      const userByEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", inviteeEmail))
        .first();
      if (userByEmail) currentUserId = userByEmail._id;
    }

    // Fallback: try authAccounts link
    if (!currentUserId) {
      try {
        const account = await ctx.db
          .query("authAccounts")
          .withIndex("providerAndAccountId", (q: any) =>
            q.eq("provider", "clerk").eq("providerAccountId", String(identity.subject))
          )
          .unique();
        if (account) currentUserId = account.userId;
      } catch (_err) {
        // Table may not exist
      }
    }

    if (!currentUserId && !inviteeEmail) return [] as any;

    // Sent invitations by current user
    if (!args.type || args.type === "sent") {
      if (currentUserId) {
        const sent = await ctx.db
          .query("invitations")
          .withIndex("by_inviter", (q) => q.eq("inviterId", currentUserId))
          .collect();
        invitations.push(
          ...(await Promise.all(
            sent.map(async (invitation) => {
              let workspace = null;
              let role = null;
              const invitee = invitation.inviteeId ? await ctx.db.get(invitation.inviteeId) : null;
              if (invitation.workspaceId) workspace = await ctx.db.get(invitation.workspaceId);
              if (invitation.roleId) role = await ctx.db.get(invitation.roleId);
              return { ...invitation, direction: "sent" as const, workspace, role, invitee };
            })
          ))
        );
      }
    }

    // Received invitations by email and by inviteeId
    if (!args.type || args.type === "received") {
      const byEmail = inviteeEmail
        ? await ctx.db
            .query("invitations")
            .withIndex("by_invitee_email", (q) => q.eq("inviteeEmail", inviteeEmail))
            .collect()
        : [];
      const byId = currentUserId
        ? await ctx.db
            .query("invitations")
            .withIndex("by_invitee_id", (q) => q.eq("inviteeId", currentUserId))
            .collect()
        : [];

      // Merge and dedupe
      const mergedMap = new Map<string, any>();
      for (const inv of [...byEmail, ...byId]) mergedMap.set(String(inv._id), inv);

      const receivedWithDetails = await Promise.all(
        Array.from(mergedMap.values()).map(async (invitation) => {
          const inviter = await ctx.db.get(invitation.inviterId);
          let workspace = null;
          let role = null;
          if (invitation.workspaceId) workspace = await ctx.db.get(invitation.workspaceId);
          if (invitation.roleId) role = await ctx.db.get(invitation.roleId);
          return { ...invitation, direction: "received" as const, inviter, workspace, role };
        })
      );
      invitations.push(...receivedWithDetails);
    }

    if (args.kind) invitations = invitations.filter((inv) => inv.type === args.kind);
    if (args.status) invitations = invitations.filter((inv) => inv.status === args.status);
    return invitations.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Accept invitation
export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (!email || email !== invitation.inviteeEmail) throw new Error("Not authorized to accept this invitation");

    if (invitation.status !== "pending") throw new Error("Invitation is no longer pending");

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(args.invitationId, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    // Accept the invitation
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      acceptedAt: Date.now(),
      inviteeId: currentUserId,
    });

    // If it's a workspace invitation, add user to workspace
    if (invitation.type === "workspace" && invitation.workspaceId && invitation.roleId) {
      const existingMembership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) => q.eq("userId", currentUserId).eq("workspaceId", invitation.workspaceId!))
        .unique();

      if (!existingMembership) {
        await ctx.db.insert("workspaceMemberships", {
          workspaceId: invitation.workspaceId,
          userId: currentUserId,
          roleId: invitation.roleId,
          status: "active",
          joinedAt: Date.now(),
          invitedBy: invitation.inviterId,
          additionalPermissions: [],
        });
      } else if (existingMembership.status !== "active") {
        await ctx.db.patch(existingMembership._id, {
          status: "active",
          roleId: invitation.roleId,
          joinedAt: Date.now(),
          invitedBy: invitation.inviterId,
        });
      }
    }

    // If it's a personal invitation, create friendship link
    if (invitation.type === "personal") {
      // Avoid duplicates (friendship could be either direction)
      const existingForward = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => q.eq("user1Id", invitation.inviterId).eq("user2Id", currentUserId))
        .first();
      const existingReverse = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => q.eq("user1Id", currentUserId).eq("user2Id", invitation.inviterId))
        .first();
      const friendship = existingForward || existingReverse;
      if (!friendship) {
        await ctx.db.insert("friendships", {
          user1Id: invitation.inviterId,
          user2Id: currentUserId,
          status: "active",
          createdAt: Date.now(),
        });
      }
    }

    return invitation;
  },
});

// Decline invitation
export const declineInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (!email || email !== invitation.inviteeEmail) throw new Error("Not authorized to decline this invitation");

    if (invitation.status !== "pending") throw new Error("Invitation is no longer pending");

    await ctx.db.patch(args.invitationId, { status: "declined" });
    return invitation;
  },
});

// Cancel invitation (for senders)
export const cancelInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    if (String(invitation.inviterId) !== String(currentUserId)) throw new Error("Not authorized to cancel this invitation");
    if (invitation.status !== "pending") throw new Error("Can only cancel pending invitations");

    await ctx.db.delete(args.invitationId);
    return invitation;
  },
});

// Get invitation by token (for public invitation links)
export const getInvitationByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) return null;

    if (invitation.expiresAt < Date.now()) {
      return null; // Expired invitation
    }

    const inviter = await ctx.db.get(invitation.inviterId);
    let workspace = null;
    let role = null;
    
    if (invitation.workspaceId) {
      workspace = await ctx.db.get(invitation.workspaceId);
    }
    
    if (invitation.roleId) {
      role = await ctx.db.get(invitation.roleId);
    }

    return {
      ...invitation,
      inviter,
      workspace,
      role,
    };
  },
});

// Accept invitation by token (for users who aren't logged in yet)
export const acceptInvitationByToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invitation) throw new Error("Invitation not found");

    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (!email || email !== invitation.inviteeEmail) throw new Error("Email mismatch - sign in with invited email");

    if (invitation.status !== "pending") throw new Error("Invitation is no longer pending");
    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      inviteeId: currentUserId,
    });

    if (invitation.type === "workspace" && invitation.workspaceId && invitation.roleId) {
      const existingMembership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) => q.eq("userId", currentUserId).eq("workspaceId", invitation.workspaceId!))
        .unique();
      if (!existingMembership) {
        await ctx.db.insert("workspaceMemberships", {
          workspaceId: invitation.workspaceId,
          userId: currentUserId,
          roleId: invitation.roleId,
          status: "active",
          joinedAt: Date.now(),
          invitedBy: invitation.inviterId,
          additionalPermissions: [],
        });
      } else if (existingMembership.status !== "active") {
        await ctx.db.patch(existingMembership._id, {
          status: "active",
          roleId: invitation.roleId,
          joinedAt: Date.now(),
          invitedBy: invitation.inviterId,
        });
      }
    }

    if (invitation.type === "personal") {
      const existingForward = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => q.eq("user1Id", invitation.inviterId).eq("user2Id", currentUserId))
        .first();
      const existingReverse = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => q.eq("user1Id", currentUserId).eq("user2Id", invitation.inviterId))
        .first();
      if (!existingForward && !existingReverse) {
        await ctx.db.insert("friendships", {
          user1Id: invitation.inviterId,
          user2Id: currentUserId,
          status: "active",
          createdAt: Date.now(),
        });
      }
    }

    return invitation;
  },
});

// Resend invitation (reset expiration and optionally update role/message)
export const resendInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    roleId: v.optional(v.id("roles")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    // Only the inviter can resend
    if (String(invitation.inviterId) !== String(currentUserId)) {
      throw new Error("Not authorized to resend this invitation");
    }

    // Can only resend pending or expired invitations
    if (invitation.status !== "pending" && invitation.status !== "expired") {
      throw new Error("Can only resend pending or expired invitations");
    }

    // Generate new token and expiration
    const newToken = generateInvitationToken();
    const newExpiresAt = invitation.type === "workspace" 
      ? Date.now() + (7 * 24 * 60 * 60 * 1000)  // 7 days for workspace
      : Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days for personal

    const updates: any = {
      status: "pending",
      token: newToken,
      expiresAt: newExpiresAt,
    };

    if (args.roleId !== undefined) updates.roleId = args.roleId;
    if (args.message !== undefined) updates.message = args.message;

    await ctx.db.patch(args.invitationId, updates);

    return { invitationId: args.invitationId, token: newToken };
  },
});

// Bulk send workspace invitations
export const sendBulkInvitations = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    invitations: v.array(v.object({
      email: v.string(),
      roleId: v.id("roles"),
      message: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // Check permission
    const { membership, role } = await requireActiveMembership(ctx, args.workspaceId);
    if (!membership && !role) throw new Error("Not authorized");
    if (!hasPermission(role, "invite_members")) throw new Error("Insufficient permissions");

    const results: Array<{
      email: string;
      success: boolean;
      invitationId?: string;
      token?: string;
      error?: string;
    }> = [];

    for (const inv of args.invitations) {
      try {
        // Check if user is already a member
        const inviteeUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), inv.email))
          .unique();

        if (inviteeUser) {
          const existingMembership = await ctx.db
            .query("workspaceMemberships")
            .withIndex("by_user_workspace", (q) => 
              q.eq("userId", inviteeUser._id).eq("workspaceId", args.workspaceId)
            )
            .unique();

          if (existingMembership && existingMembership.status === "active") {
            results.push({ email: inv.email, success: false, error: "Already a member" });
            continue;
          }
        }

        // Check for existing pending invitation
        const existingInvitation = await ctx.db
          .query("invitations")
          .withIndex("by_invitee_email", (q) => q.eq("inviteeEmail", inv.email))
          .filter((q) =>
            q.and(
              q.eq(q.field("workspaceId"), args.workspaceId),
              q.eq(q.field("status"), "pending")
            )
          )
          .unique();

        if (existingInvitation) {
          results.push({ email: inv.email, success: false, error: "Invitation already sent" });
          continue;
        }

        const token = generateInvitationToken();
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);

        const invitationId = await ctx.db.insert("invitations", {
          type: "workspace",
          workspaceId: args.workspaceId,
          inviterId: currentUserId,
          inviteeEmail: inv.email,
          inviteeId: inviteeUser?._id,
          roleId: inv.roleId,
          status: "pending",
          message: inv.message,
          expiresAt,
          token,
        });

        results.push({
          email: inv.email,
          success: true,
          invitationId: invitationId as unknown as string,
          token,
        });
      } catch (err) {
        results.push({
          email: inv.email,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

// Get invitation statistics for a workspace
export const getInvitationStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const allowed = await canPermission(ctx, args.workspaceId, PERMS.INVITE_MEMBERS);
    if (!allowed) return null;

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const now = Date.now();
    const stats = {
      total: invitations.length,
      pending: 0,
      accepted: 0,
      declined: 0,
      expired: 0,
      expiringSoon: 0, // Within 24 hours
    };

    for (const inv of invitations) {
      switch (inv.status) {
        case "pending":
          stats.pending++;
          if (inv.expiresAt - now < 24 * 60 * 60 * 1000 && inv.expiresAt > now) {
            stats.expiringSoon++;
          }
          break;
        case "accepted":
          stats.accepted++;
          break;
        case "declined":
          stats.declined++;
          break;
        case "expired":
          stats.expired++;
          break;
      }
    }

    return stats;
  },
});

// Clean up expired invitations (mark as expired)
export const cleanupExpiredInvitations = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    let invitations;
    if (args.workspaceId) {
      // Check permission for specific workspace
      const allowed = await canPermission(ctx, args.workspaceId, PERMS.INVITE_MEMBERS);
      if (!allowed) throw new Error("Not authorized");

      invitations = await ctx.db
        .query("invitations")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
    } else {
      // Only clean up invitations sent by current user
      invitations = await ctx.db
        .query("invitations")
        .withIndex("by_inviter", (q) => q.eq("inviterId", currentUserId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
    }

    const now = Date.now();
    let cleanedCount = 0;

    for (const inv of invitations) {
      if (inv.expiresAt < now) {
        await ctx.db.patch(inv._id, { status: "expired" });
        cleanedCount++;
      }
    }

    return { cleanedCount };
  },
});

// Search invitations
export const searchInvitations = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allowed = await canPermission(ctx, args.workspaceId, PERMS.INVITE_MEMBERS);
    if (!allowed) return [];

    let invitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Filter by status
    if (args.status) {
      invitations = invitations.filter((i) => i.status === args.status);
    }

    // Search by email
    const searchQuery = args.query.toLowerCase().trim();
    if (searchQuery) {
      invitations = invitations.filter((i) =>
        i.inviteeEmail.toLowerCase().includes(searchQuery)
      );
    }

    // Hydrate
    const enriched = await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await ctx.db.get(inv.inviterId);
        const role = inv.roleId ? await ctx.db.get(inv.roleId) : null;
        const invitee = inv.inviteeId ? await ctx.db.get(inv.inviteeId) : null;
        return { ...inv, inviter, role, invitee };
      })
    );

    const limit = args.limit || 50;
    return enriched
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);
  },
});
