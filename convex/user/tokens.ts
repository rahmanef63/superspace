/**
 * Access Tokens API
 *
 * API keys and temporary access tokens for integrations.
 * Tokens are hashed for security - only the prefix is stored for identification.
 *
 * @module convex/user/tokens
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { logAuditEvent } from "../shared/audit";

// ============================================================================
// HELPERS
// ============================================================================

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

/**
 * Generate a simple hash for token storage
 * In production, use a proper crypto library
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Generate a random token
 */
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "ssp_"; // SuperSpace prefix
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================================================
// ACCESS TOKENS
// ============================================================================

export const createAccessToken = mutation({
  args: {
    name: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    scopes: v.array(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    // Generate token
    const token = generateToken();
    const tokenPrefix = token.substring(0, 8);
    const tokenHash = simpleHash(token);

    // Calculate expiration
    const expiresAt = args.expiresInDays
      ? Date.now() + args.expiresInDays * 24 * 60 * 60 * 1000
      : undefined;

    const tokenId = await ctx.db.insert("accessTokens", {
      userId: user._id,
      workspaceId: args.workspaceId,
      name: args.name,
      tokenHash,
      tokenPrefix,
      scopes: args.scopes,
      expiresAt,
      createdAt: Date.now(),
      isActive: true,
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId ?? "system",
      action: "access_token.created",
      actor: user.clerkId ?? "unknown",
      actorUserId: user._id,
      resourceType: "accessToken",
      resourceId: tokenId,
      metadata: {
        name: args.name,
        scopes: args.scopes,
        expiresAt,
      },
    });

    // Return the full token ONLY on creation (never stored)
    return {
      id: tokenId,
      token, // This is the only time the full token is visible!
      prefix: tokenPrefix,
      name: args.name,
      scopes: args.scopes,
      expiresAt,
    };
  },
});

export const listAccessTokens = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    let tokensQuery = ctx.db
      .query("accessTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    const tokens = await tokensQuery.collect();

    // Filter by workspace if specified
    const filteredTokens = args.workspaceId
      ? tokens.filter((t) => t.workspaceId === args.workspaceId)
      : tokens;

    // Never return the hash
    return filteredTokens.map((token) => ({
      _id: token._id,
      name: token.name,
      tokenPrefix: token.tokenPrefix,
      scopes: token.scopes,
      workspaceId: token.workspaceId,
      expiresAt: token.expiresAt,
      lastUsedAt: token.lastUsedAt,
      createdAt: token.createdAt,
      isActive: token.isActive,
      revokedAt: token.revokedAt,
    }));
  },
});

export const revokeAccessToken = mutation({
  args: {
    tokenId: v.id("accessTokens"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const token = await ctx.db.get(args.tokenId);
    if (!token || token.userId !== user._id) {
      throw new Error("Token not found");
    }

    if (token.revokedAt) {
      throw new Error("Token already revoked");
    }

    await ctx.db.patch(args.tokenId, {
      isActive: false,
      revokedAt: Date.now(),
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: token.workspaceId ?? "system",
      action: "access_token.revoked",
      actor: user.clerkId ?? "unknown",
      actorUserId: user._id,
      resourceType: "accessToken",
      resourceId: args.tokenId,
      metadata: {
        name: token.name,
      },
    });

    return { success: true };
  },
});

export const updateTokenLastUsed = mutation({
  args: {
    tokenId: v.id("accessTokens"),
  },
  async handler(ctx, args) {
    const token = await ctx.db.get(args.tokenId);
    if (!token) {
      throw new Error("Token not found");
    }

    await ctx.db.patch(args.tokenId, {
      lastUsedAt: Date.now(),
    });
  },
});

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

export const requestAccountDeletion = mutation({
  args: {
    reason: v.optional(v.string()),
    exportData: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    // Check for existing request
    const existing = await ctx.db
      .query("accountDeletionRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "requested"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .first();

    if (existing) {
      throw new Error("Account deletion already requested");
    }

    // Generate confirmation token
    const confirmToken = generateToken();

    // Schedule deletion for 30 days
    const scheduledDeletionAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const requestId = await ctx.db.insert("accountDeletionRequests", {
      userId: user._id,
      status: "requested",
      requestedAt: Date.now(),
      confirmToken: simpleHash(confirmToken),
      scheduledDeletionAt,
      exportRequested: args.exportData ?? false,
      reason: args.reason,
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "account.deletion_requested",
      actor: user.clerkId ?? "unknown",
      actorUserId: user._id,
      resourceType: "user",
      resourceId: user._id,
      metadata: {
        requestId,
        exportRequested: args.exportData,
        scheduledDeletionAt,
      },
    });

    return {
      requestId,
      confirmToken, // Send this to user for confirmation
      scheduledDeletionAt,
    };
  },
});

export const confirmAccountDeletion = mutation({
  args: {
    confirmToken: v.string(),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const request = await ctx.db
      .query("accountDeletionRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "requested"))
      .first();

    if (!request) {
      throw new Error("No pending deletion request found");
    }

    // Verify token
    const tokenHash = simpleHash(args.confirmToken);
    if (request.confirmToken !== tokenHash) {
      throw new Error("Invalid confirmation token");
    }

    await ctx.db.patch(request._id, {
      status: "confirmed",
      confirmedAt: Date.now(),
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "account.deletion_confirmed",
      actor: user.clerkId ?? "unknown",
      actorUserId: user._id,
      resourceType: "user",
      resourceId: user._id,
    });

    return {
      success: true,
      scheduledDeletionAt: request.scheduledDeletionAt,
    };
  },
});

export const cancelAccountDeletion = mutation({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const request = await ctx.db
      .query("accountDeletionRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "requested"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .first();

    if (!request) {
      throw new Error("No pending deletion request found");
    }

    await ctx.db.patch(request._id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "account.deletion_cancelled",
      actor: user.clerkId ?? "unknown",
      actorUserId: user._id,
      resourceType: "user",
      resourceId: user._id,
    });

    return { success: true };
  },
});

export const getAccountDeletionStatus = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const request = await ctx.db
      .query("accountDeletionRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (!request) {
      return null;
    }

    return {
      status: request.status,
      requestedAt: request.requestedAt,
      confirmedAt: request.confirmedAt,
      scheduledDeletionAt: request.scheduledDeletionAt,
      completedAt: request.completedAt,
      cancelledAt: request.cancelledAt,
      exportRequested: request.exportRequested,
      exportUrl: request.exportUrl,
      exportExpiresAt: request.exportExpiresAt,
    };
  },
});
