/**
 * Platform Admin Queries
 * 
 * Provides queries and mutations for platform administration.
 * Only platform admins can access these endpoints.
 */

import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { isPlatformAdmin, getAdminEmailsForDebug } from "../../lib/platformAdmin";
import { requirePlatformAdmin, checkPlatformAdmin } from "../lib/rbac";

/**
 * Check if the current user is a platform admin
 */
export const checkMyPlatformAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAuthenticated: false,
        isPlatformAdmin: false,
        email: null,
      };
    }
    
    const email = (identity.email ?? identity.emailVerified ?? "") as string;
    const isAdmin = isPlatformAdmin(email);
    
    return {
      isAuthenticated: true,
      isPlatformAdmin: isAdmin,
      email,
      name: identity.name ?? null,
      clerkId: identity.subject,
    };
  },
});

/**
 * Get all custom features (platform admin only)
 */
export const getAllCustomFeatures = query({
  args: {},
  handler: async (ctx) => {
    // Check platform admin access
    const isAdmin = await checkPlatformAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Platform administrator access required");
    }
    
    const features = await ctx.db
      .query("customFeatures")
      .order("desc")
      .collect();
    
    return features;
  },
});

/**
 * Get feature access for a workspace (platform admin only)
 */
export const getWorkspaceFeatureAccess = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const isAdmin = await checkPlatformAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Platform administrator access required");
    }
    
    const access = await ctx.db
      .query("featureAccess")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    
    return access;
  },
});

/**
 * Update feature status (platform admin only)
 */
export const updateFeatureStatus = mutation({
  args: {
    featureId: v.id("customFeatures"),
    status: v.union(
      v.literal("development"),
      v.literal("beta"),
      v.literal("stable"),
      v.literal("deprecated"),
      v.literal("disabled")
    ),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db.get(args.featureId);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    await ctx.db.patch(args.featureId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Grant feature access to a workspace (platform admin only)
 */
export const grantFeatureAccess = mutation({
  args: {
    featureId: v.string(),
    workspaceId: v.id("workspaces"),
    accessLevel: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("user"),
      v.literal("disabled")
    ),
  },
  handler: async (ctx, args) => {
    const actor = await requirePlatformAdmin(ctx);
    
    // Check if access already exists
    const existing = await ctx.db
      .query("featureAccess")
      .withIndex("by_feature_workspace", (q) => 
        q.eq("featureId", args.featureId).eq("workspaceId", args.workspaceId)
      )
      .first();
    
    // Get the granting user
    const identity = await ctx.auth.getUserIdentity();
    const grantingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity!.subject))
      .first();
    
    if (!grantingUser) {
      throw new Error("Granting user not found");
    }
    
    if (existing) {
      // Update existing access
      await ctx.db.patch(existing._id, {
        accessLevel: args.accessLevel,
        updatedAt: Date.now(),
      });
    } else {
      // Create new access
      await ctx.db.insert("featureAccess", {
        featureId: args.featureId,
        workspaceId: args.workspaceId,
        accessLevel: args.accessLevel,
        grantedBy: grantingUser._id,
        grantedAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

/**
 * Get all workspaces (platform admin only)
 */
export const getAllWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await checkPlatformAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Platform administrator access required");
    }
    
    const workspaces = await ctx.db
      .query("workspaces")
      .order("desc")
      .collect();
    
    return workspaces;
  },
});

/**
 * Get platform admin debug info (only in development)
 */
export const getPlatformAdminDebugInfo = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await checkPlatformAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Platform administrator access required");
    }
    
    return {
      adminEmails: getAdminEmailsForDebug(),
      timestamp: Date.now(),
    };
  },
});
