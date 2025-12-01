/**
 * Platform Admin Queries
 * 
 * Queries for platform-wide administration.
 * These queries are restricted to platform admins only.
 */

import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { isPlatformAdmin } from "../lib/platformAdmin";

// List all users (platform admin only)
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("blocked")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email || !isPlatformAdmin(identity.email)) {
      throw new Error("Not authorized - platform admin access required");
    }

    let users = await ctx.db.query("users").collect();

    // Filter by status
    if (args.status) {
      users = users.filter((u) => (u.status || "active") === args.status);
    }

    // Apply limit
    const limit = args.limit || 100;
    users = users.slice(0, limit);

    return users.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// List all workspaces (platform admin only)
export const listWorkspaces = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("organization"),
      v.literal("institution"),
      v.literal("group"),
      v.literal("family"),
      v.literal("personal")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email || !isPlatformAdmin(identity.email)) {
      throw new Error("Not authorized - platform admin access required");
    }

    let workspaces = await ctx.db.query("workspaces").collect();

    // Filter by type
    if (args.type) {
      workspaces = workspaces.filter((w) => w.type === args.type);
    }

    // Apply limit
    const limit = args.limit || 100;
    workspaces = workspaces.slice(0, limit);

    // Hydrate with creator info and member count
    const enriched = await Promise.all(
      workspaces.map(async (ws) => {
        const creator = await ctx.db.get(ws.createdBy);
        const memberships = await ctx.db
          .query("workspaceMemberships")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        
        return {
          ...ws,
          creator,
          memberCount: memberships.length,
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get platform statistics
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email || !isPlatformAdmin(identity.email)) {
      throw new Error("Not authorized - platform admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const workspaces = await ctx.db.query("workspaces").collect();
    const invitations = await ctx.db.query("invitations").collect();
    const memberships = await ctx.db.query("workspaceMemberships").collect();

    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    return {
      users: {
        total: users.length,
        active: users.filter((u) => (u.status || "active") === "active").length,
        inactive: users.filter((u) => u.status === "inactive").length,
        blocked: users.filter((u) => u.status === "blocked").length,
        newThisWeek: users.filter((u) => u._creationTime > oneWeekAgo).length,
        newThisMonth: users.filter((u) => u._creationTime > oneMonthAgo).length,
      },
      workspaces: {
        total: workspaces.length,
        byType: {
          organization: workspaces.filter((w) => w.type === "organization").length,
          institution: workspaces.filter((w) => w.type === "institution").length,
          group: workspaces.filter((w) => w.type === "group").length,
          family: workspaces.filter((w) => w.type === "family").length,
          personal: workspaces.filter((w) => w.type === "personal").length,
        },
        public: workspaces.filter((w) => w.isPublic).length,
        private: workspaces.filter((w) => !w.isPublic).length,
        newThisWeek: workspaces.filter((w) => w._creationTime > oneWeekAgo).length,
        newThisMonth: workspaces.filter((w) => w._creationTime > oneMonthAgo).length,
      },
      invitations: {
        total: invitations.length,
        pending: invitations.filter((i) => i.status === "pending").length,
        accepted: invitations.filter((i) => i.status === "accepted").length,
        declined: invitations.filter((i) => i.status === "declined").length,
        expired: invitations.filter((i) => i.status === "expired").length,
      },
      memberships: {
        total: memberships.length,
        active: memberships.filter((m) => m.status === "active").length,
        inactive: memberships.filter((m) => m.status === "inactive").length,
      },
    };
  },
});

// List all invitations across platform (platform admin only)
export const listAllInvitations = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    )),
    type: v.optional(v.union(
      v.literal("workspace"),
      v.literal("personal")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email || !isPlatformAdmin(identity.email)) {
      throw new Error("Not authorized - platform admin access required");
    }

    let invitations = await ctx.db.query("invitations").collect();

    // Filter by status
    if (args.status) {
      invitations = invitations.filter((i) => i.status === args.status);
    }

    // Filter by type
    if (args.type) {
      invitations = invitations.filter((i) => i.type === args.type);
    }

    // Apply limit
    const limit = args.limit || 100;
    invitations = invitations.slice(0, limit);

    // Hydrate with related data
    const enriched = await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await ctx.db.get(inv.inviterId);
        const invitee = inv.inviteeId ? await ctx.db.get(inv.inviteeId) : null;
        const workspace = inv.workspaceId ? await ctx.db.get(inv.workspaceId) : null;
        const role = inv.roleId ? await ctx.db.get(inv.roleId) : null;

        return {
          ...inv,
          inviter,
          invitee,
          workspace,
          role,
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Update user status (platform admin only)
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email || !isPlatformAdmin(identity.email)) {
      throw new Error("Not authorized - platform admin access required");
    }

    await ctx.db.patch(args.userId, { status: args.status });
    return { success: true };
  },
});
