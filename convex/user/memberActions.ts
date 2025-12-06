import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getCurrentUserOrThrow, getCurrentUser } from "./users";
import type { Id } from "../_generated/dataModel";

/**
 * Member Actions
 * 
 * Handles member-related actions for the Chat feature:
 * - Add/remove from favorites
 * - Block/unblock member
 * - Mute/unmute notifications
 * - Get member profile
 * - Get shared media/files/links with member
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get member profile by user ID
 * Note: userId can be a user ID or conversation participant ID
 * We try to find the user, and return null if not found (graceful handling)
 */
export const getMemberProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Try to get user - gracefully handle if ID is not from users table
    try {
      const user = await ctx.db.get(userId as Id<"users">);
      if (!user) return null;
      
      // Type guard to ensure this is a user document
      if (!("email" in user)) return null;

      return {
        id: user._id,
        name: user.name ?? "",
        email: user.email ?? "",
        avatarUrl: user.avatarUrl ?? undefined,
        status: user.status ?? "active",
        metadata: user.metadata ?? {},
      };
    } catch {
      // ID is not a valid document ID or wrong table
      return null;
    }
  },
});

/**
 * Check if a member is in favorites
 */
export const isMemberFavorite = query({
  args: { memberId: v.string() },
  handler: async (ctx, { memberId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return false;

    // Check in starredItems for user type
    const starred = await ctx.db
      .query("starredItems")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("itemType"), "message"),
          q.eq(q.field("itemId"), memberId)
        )
      )
      .first();

    return starred !== null;
  },
});

/**
 * Check if a member is blocked
 */
export const isMemberBlocked = query({
  args: { memberId: v.string() },
  handler: async (ctx, { memberId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return false;

    try {
      const memberIdTyped = memberId as Id<"users">;
      
      // Check in friendships table for blocked status
      const friendship = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => 
          q.eq("user1Id", currentUser._id).eq("user2Id", memberIdTyped)
        )
        .first();

      if (friendship?.status === "blocked" && friendship.blockedBy === currentUser._id) {
        return true;
      }

      // Check reverse
      const reverseFriendship = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => 
          q.eq("user1Id", memberIdTyped).eq("user2Id", currentUser._id)
        )
        .first();

      return reverseFriendship?.status === "blocked" && reverseFriendship.blockedBy === currentUser._id;
    } catch {
      return false;
    }
  },
});

/**
 * Get shared media with a member (placeholder - returns empty for now)
 */
export const getSharedMedia = query({
  args: { 
    memberId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { memberId, limit = 20 }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // TODO: Query messages with attachments between current user and member
    // For now, return empty array as placeholder
    return [];
  },
});

/**
 * Get shared files with a member (placeholder - returns empty for now)
 */
export const getSharedFiles = query({
  args: { 
    memberId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { memberId, limit = 20 }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // TODO: Query files shared between current user and member
    return [];
  },
});

/**
 * Get shared links with a member (placeholder - returns empty for now)
 */
export const getSharedLinks = query({
  args: { 
    memberId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { memberId, limit = 20 }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // TODO: Query links shared between current user and member
    return [];
  },
});

/**
 * Get common groups with a member (placeholder - returns empty for now)
 */
export const getCommonGroups = query({
  args: { memberId: v.string() },
  handler: async (ctx, { memberId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // TODO: Query conversations where both users are participants
    return [];
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Add member to favorites
 */
export const addToFavorites = mutation({
  args: { 
    memberId: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { memberId, workspaceId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    
    // Try to get member info - gracefully handle if not a user
    let memberName = "Unknown";
    let memberEmail = "";
    try {
      const member = await ctx.db.get(memberId as Id<"users">);
      if (member && "name" in member) {
        memberName = member.name || memberName;
        memberEmail = member.email || memberEmail;
      }
    } catch {
      // Not a valid user ID, continue with defaults
    }

    // Check if already starred
    const existing = await ctx.db
      .query("starredItems")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", currentUser._id).eq("workspaceId", workspaceId)
      )
      .filter((q) => q.eq(q.field("itemId"), memberId))
      .first();

    if (existing) return existing._id;

    // Add to starred items
    return await ctx.db.insert("starredItems", {
      userId: currentUser._id,
      workspaceId,
      itemType: "message", // Using message type for members temporarily
      itemId: memberId,
      starredAt: Date.now(),
      metadata: {
        title: memberName,
        preview: memberEmail,
      },
    });
  },
});

/**
 * Remove member from favorites
 */
export const removeFromFavorites = mutation({
  args: { 
    memberId: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { memberId, workspaceId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    const existing = await ctx.db
      .query("starredItems")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", currentUser._id).eq("workspaceId", workspaceId)
      )
      .filter((q) => q.eq(q.field("itemId"), memberId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return true;
  },
});

/**
 * Block a member
 */
export const blockMember = mutation({
  args: { memberId: v.string() },
  handler: async (ctx, { memberId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const memberIdTyped = memberId as Id<"users">;

    if (currentUser._id === memberIdTyped) {
      throw new Error("Cannot block yourself");
    }

    try {
      // Check for existing friendship
      const existing = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => 
          q.eq("user1Id", currentUser._id).eq("user2Id", memberIdTyped)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: "blocked",
          blockedBy: currentUser._id,
        });
        return existing._id;
      }

      // Check reverse direction
      const reverse = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => 
          q.eq("user1Id", memberIdTyped).eq("user2Id", currentUser._id)
        )
        .first();

      if (reverse) {
        await ctx.db.patch(reverse._id, {
          status: "blocked",
          blockedBy: currentUser._id,
        });
        return reverse._id;
      }

      // Create new blocked friendship
      return await ctx.db.insert("friendships", {
        user1Id: currentUser._id,
        user2Id: memberIdTyped,
        status: "blocked",
        blockedBy: currentUser._id,
        createdAt: Date.now(),
      });
    } catch {
      throw new Error("Failed to block member");
    }
  },
});

/**
 * Unblock a member
 */
export const unblockMember = mutation({
  args: { memberId: v.string() },
  handler: async (ctx, { memberId }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);
    const memberIdTyped = memberId as Id<"users">;

    try {
      // Check both directions
      const existing = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => 
          q.eq("user1Id", currentUser._id).eq("user2Id", memberIdTyped)
        )
        .first();

      if (existing?.status === "blocked" && existing.blockedBy === currentUser._id) {
        await ctx.db.patch(existing._id, {
          status: "active",
          blockedBy: undefined,
        });
        return true;
      }

      const reverse = await ctx.db
        .query("friendships")
        .withIndex("by_users", (q) => 
          q.eq("user1Id", memberIdTyped).eq("user2Id", currentUser._id)
        )
        .first();

      if (reverse?.status === "blocked" && reverse.blockedBy === currentUser._id) {
        await ctx.db.patch(reverse._id, {
          status: "active",
          blockedBy: undefined,
        });
        return true;
      }

      return false;
    } catch {
      throw new Error("Failed to unblock member");
    }
  },
});

/**
 * Report a member (placeholder - logs the report for now)
 */
export const reportMember = mutation({
  args: { 
    memberId: v.string(),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, { memberId, reason, details }) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    // TODO: Create a reports table and store the report
    // For now, just log it
    console.log("Report submitted:", {
      reporterId: currentUser._id,
      reportedId: memberId,
      reason,
      details,
      timestamp: Date.now(),
    });

    return true;
  },
});
