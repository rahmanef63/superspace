/**
 * Session & Device Management API
 *
 * Queries and mutations for login history tracking, device management,
 * and workspace profile management.
 *
 * @module convex/user/sessions
 */

import { mutation, query, internalMutation } from "../_generated/server";
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

// ============================================================================
// LOGIN HISTORY
// ============================================================================

/**
 * Record a login event (called from webhook or internal)
 */
export const recordLogin = internalMutation({
  args: {
    userId: v.id("users"),
    method: v.union(
      v.literal("password"),
      v.literal("oauth"),
      v.literal("magic_link"),
      v.literal("passkey"),
      v.literal("sso")
    ),
    provider: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    location: v.optional(
      v.object({
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        countryCode: v.optional(v.string()),
      })
    ),
    success: v.boolean(),
    failureReason: v.optional(v.string()),
  },
  async handler(ctx, args) {
    await ctx.db.insert("loginHistory", {
      userId: args.userId,
      timestamp: Date.now(),
      method: args.method,
      provider: args.provider,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      location: args.location,
      success: args.success,
      failureReason: args.failureReason,
    });
  },
});

export const getLoginHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const history = await ctx.db
      .query("loginHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 20);

    return history;
  },
});

// ============================================================================
// DEVICE MANAGEMENT
// ============================================================================

export const registerDevice = mutation({
  args: {
    deviceId: v.string(),
    deviceName: v.optional(v.string()),
    deviceType: v.union(
      v.literal("desktop"),
      v.literal("mobile"),
      v.literal("tablet"),
      v.literal("unknown")
    ),
    browser: v.optional(v.string()),
    os: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if device already registered
    const existing = await ctx.db
      .query("userDevices")
      .withIndex("by_user_device", (q) =>
        q.eq("userId", user._id).eq("deviceId", args.deviceId)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      // Update last seen
      await ctx.db.patch(existing._id, {
        lastSeenAt: now,
        deviceName: args.deviceName ?? existing.deviceName,
        browser: args.browser ?? existing.browser,
        os: args.os ?? existing.os,
        ipAddress: args.ipAddress ?? existing.ipAddress,
      });
      return existing._id;
    } else {
      // Register new device
      const deviceId = await ctx.db.insert("userDevices", {
        userId: user._id,
        deviceId: args.deviceId,
        deviceName: args.deviceName,
        deviceType: args.deviceType,
        browser: args.browser,
        os: args.os,
        firstSeenAt: now,
        lastSeenAt: now,
        isTrusted: false,
        ipAddress: args.ipAddress,
      });

      return deviceId;
    }
  },
});

export const getUserDevices = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const devices = await ctx.db
      .query("userDevices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return devices;
  },
});

export const trustDevice = mutation({
  args: {
    deviceId: v.id("userDevices"),
    trusted: v.boolean(),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const device = await ctx.db.get(args.deviceId);
    if (!device || device.userId !== user._id) {
      throw new Error("Device not found");
    }

    await ctx.db.patch(args.deviceId, {
      isTrusted: args.trusted,
    });
  },
});

export const removeDevice = mutation({
  args: {
    deviceId: v.id("userDevices"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const device = await ctx.db.get(args.deviceId);
    if (!device || device.userId !== user._id) {
      throw new Error("Device not found");
    }

    await ctx.db.delete(args.deviceId);

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: "system",
      action: "device.removed",
      actor: user.clerkId ?? "unknown",
      actorUserId: user._id,
      resourceType: "device",
      resourceId: args.deviceId,
      metadata: {
        deviceName: device.deviceName,
        deviceType: device.deviceType,
      },
    });
  },
});

// ============================================================================
// WORKSPACE PROFILES
// ============================================================================

export const getWorkspaceProfile = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const profile = await ctx.db
      .query("workspaceProfiles")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", user._id).eq("workspaceId", args.workspaceId)
      )
      .unique();

    return profile;
  },
});

export const updateWorkspaceProfile = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    displayName: v.optional(v.string()),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    avatarOverride: v.optional(v.string()),
    bio: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const existing = await ctx.db
      .query("workspaceProfiles")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", user._id).eq("workspaceId", args.workspaceId)
      )
      .unique();

    const { workspaceId, ...updates } = args;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("workspaceProfiles", {
        userId: user._id,
        workspaceId: args.workspaceId,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getWorkspaceProfileByUser = query({
  args: {
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, args) {
    const profile = await ctx.db
      .query("workspaceProfiles")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", args.userId).eq("workspaceId", args.workspaceId)
      )
      .unique();

    // If no workspace profile, return the base user profile
    if (!profile) {
      const user = await ctx.db.get(args.userId);
      if (!user) return null;

      return {
        userId: args.userId,
        workspaceId: args.workspaceId,
        displayName: user.name,
        avatarOverride: user.avatarUrl,
        isPublic: true,
      };
    }

    return profile;
  },
});
