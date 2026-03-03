/**
 * User Admin API
 *
 * Admin mutations for user status management (suspend, reactivate, block)
 * and impersonation features.
 *
 * @module convex/user/admin
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { logAuditEvent } from "../shared/audit";

// ============================================================================
// HELPERS
// ============================================================================

async function requireAdmin(ctx: any): Promise<{ _id: Id<"users">; clerkId: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is admin (via adminUsers table or platform admin)
  const adminUser = await ctx.db
    .query("adminUsers")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  // Check platform admin status
  const isPlatformAdmin = process.env.PLATFORM_ADMIN_EMAILS?.split(",")
    .map((e: string) => e.trim().toLowerCase())
    .includes(identity.email?.toLowerCase());

  if (!adminUser && !isPlatformAdmin) {
    throw new Error("Admin access required");
  }

  return { _id: user._id, clerkId: identity.subject };
}

async function getCurrentUserOrThrow(ctx: any): Promise<{ _id: Id<"users">; clerkId?: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

// ============================================================================
// USER STATUS MANAGEMENT
// ============================================================================

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    suspendedUntil: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const admin = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    if (targetUser._id === admin._id) {
      throw new Error("Cannot suspend yourself");
    }

    const previousStatus = targetUser.status ?? "active";

    // Update user status
    await ctx.db.patch(args.userId, {
      status: "inactive",
    });

    // Record status history
    await ctx.db.insert("userStatusHistory", {
      userId: args.userId,
      previousStatus,
      newStatus: "inactive",
      changedBy: admin._id,
      reason: args.reason,
      changedAt: Date.now(),
      expiresAt: args.suspendedUntil,
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "user.suspended",
      actor: admin.clerkId,
      actorUserId: admin._id,
      resourceType: "user",
      resourceId: args.userId,
      metadata: {
        reason: args.reason,
        suspendedUntil: args.suspendedUntil,
      },
    });

    return { success: true };
  },
});

export const reactivateUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const admin = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const previousStatus = targetUser.status ?? "active";

    // Update user status
    await ctx.db.patch(args.userId, {
      status: "active",
    });

    // Record status history
    await ctx.db.insert("userStatusHistory", {
      userId: args.userId,
      previousStatus,
      newStatus: "active",
      changedBy: admin._id,
      reason: args.reason ?? "Reactivated by admin",
      changedAt: Date.now(),
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "user.reactivated",
      actor: admin.clerkId,
      actorUserId: admin._id,
      resourceType: "user",
      resourceId: args.userId,
      metadata: {
        reason: args.reason,
      },
    });

    return { success: true };
  },
});

export const blockUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  async handler(ctx, args) {
    const admin = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    if (targetUser._id === admin._id) {
      throw new Error("Cannot block yourself");
    }

    const previousStatus = targetUser.status ?? "active";

    // Update user status
    await ctx.db.patch(args.userId, {
      status: "blocked",
    });

    // Record status history
    await ctx.db.insert("userStatusHistory", {
      userId: args.userId,
      previousStatus,
      newStatus: "blocked",
      changedBy: admin._id,
      reason: args.reason,
      changedAt: Date.now(),
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "user.blocked",
      actor: admin.clerkId,
      actorUserId: admin._id,
      resourceType: "user",
      resourceId: args.userId,
      metadata: {
        reason: args.reason,
      },
    });

    return { success: true };
  },
});

export const getUserStatusHistory = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const history = await ctx.db
      .query("userStatusHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return history;
  },
});

// ============================================================================
// IMPERSONATION
// ============================================================================

export const startImpersonation = mutation({
  args: {
    targetUserId: v.id("users"),
    reason: v.string(),
  },
  async handler(ctx, args) {
    const admin = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    if (targetUser._id === admin._id) {
      throw new Error("Cannot impersonate yourself");
    }

    // Check for existing active impersonation
    const existingImpersonation = await ctx.db
      .query("impersonationLogs")
      .withIndex("by_admin", (q) => q.eq("adminId", admin._id))
      .filter((q) => q.eq(q.field("endedAt"), undefined))
      .first();

    if (existingImpersonation) {
      throw new Error("Already impersonating another user. End current session first.");
    }

    const impersonationId = await ctx.db.insert("impersonationLogs", {
      adminId: admin._id,
      targetUserId: args.targetUserId,
      startedAt: Date.now(),
      reason: args.reason,
      actions: [],
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "impersonation.started",
      actor: admin.clerkId,
      actorUserId: admin._id,
      resourceType: "user",
      resourceId: args.targetUserId,
      metadata: {
        reason: args.reason,
        impersonationId,
      },
    });

    return { impersonationId };
  },
});

export const endImpersonation = mutation({
  args: {
    impersonationId: v.id("impersonationLogs"),
  },
  async handler(ctx, args) {
    const admin = await requireAdmin(ctx);

    const impersonation = await ctx.db.get(args.impersonationId);
    if (!impersonation) {
      throw new Error("Impersonation session not found");
    }

    if (impersonation.adminId !== admin._id) {
      throw new Error("Cannot end another admin's impersonation session");
    }

    if (impersonation.endedAt) {
      throw new Error("Impersonation session already ended");
    }

    await ctx.db.patch(args.impersonationId, {
      endedAt: Date.now(),
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "impersonation.ended",
      actor: admin.clerkId,
      actorUserId: admin._id,
      resourceType: "user",
      resourceId: impersonation.targetUserId,
      metadata: {
        impersonationId: args.impersonationId,
        duration: Date.now() - impersonation.startedAt,
      },
    });

    return { success: true };
  },
});

export const getImpersonationHistory = query({
  args: {
    userId: v.optional(v.id("users")),
    adminId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    let query;

    if (args.adminId) {
      query = ctx.db
        .query("impersonationLogs")
        .withIndex("by_admin", (q) => q.eq("adminId", args.adminId!));
    } else if (args.userId) {
      query = ctx.db
        .query("impersonationLogs")
        .withIndex("by_target", (q) => q.eq("targetUserId", args.userId!));
    } else {
      query = ctx.db.query("impersonationLogs").withIndex("by_started_at");
    }

    const results = await query.order("desc").take(args.limit ?? 50);
    return results;
  },
});

export const getActiveImpersonation = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const activeImpersonation = await ctx.db
      .query("impersonationLogs")
      .withIndex("by_admin", (q) => q.eq("adminId", user._id))
      .filter((q) => q.eq(q.field("endedAt"), undefined))
      .first();

    if (!activeImpersonation) {
      return null;
    }

    const targetUser = await ctx.db.get(activeImpersonation.targetUserId);

    return {
      ...activeImpersonation,
      targetUser,
    };
  },
});
