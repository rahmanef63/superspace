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
        username: (user.metadata as any)?.username ?? undefined,
        email: user.email ?? "",
        avatar: user.avatarUrl ?? undefined,
        status: user.status ?? "active",
        about: (user.metadata as any)?.bio ?? (user.metadata as any)?.about ?? undefined,
        phoneNumber: (user.metadata as any)?.phone ?? (user.metadata as any)?.phoneNumber ?? undefined,
        location: (user.metadata as any)?.location ?? (user.metadata as any)?.timezone ?? undefined,
        jobTitle: (user.metadata as any)?.role ?? (user.metadata as any)?.jobTitle ?? (user.metadata as any)?.title ?? undefined,
        lastSeen: (user.metadata as any)?.lastSeen ?? undefined,
        presenceLabel: (user.metadata as any)?.statusMessage ?? (user.metadata as any)?.availability ?? undefined,
        tags: Array.isArray((user.metadata as any)?.tags)
          ? ((user.metadata as any).tags as any[]).map((t) => String(t))
          : undefined,
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

      // Check in socialContacts table for blocked status
      const Contactship = await ctx.db
        .query("socialContacts")
        .withIndex("by_users", (q) =>
          q.eq("user1Id", currentUser._id).eq("user2Id", memberIdTyped)
        )
        .first();

      if (Contactship?.status === "blocked" && Contactship.blockedBy === currentUser._id) {
        return true;
      }

      // Check reverse
      const reverseContactship = await ctx.db
        .query("socialContacts")
        .withIndex("by_users", (q) =>
          q.eq("user1Id", memberIdTyped).eq("user2Id", currentUser._id)
        )
        .first();

      return reverseContactship?.status === "blocked" && reverseContactship.blockedBy === currentUser._id;
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
    memberId: v.optional(v.string()),
    conversationId: v.optional(v.id("conversations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { memberId, conversationId, limit = 20 }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const sharedConversationIds = await getSharedConversationIds(
      ctx,
      currentUser._id,
      memberId,
      conversationId
    );
    if (sharedConversationIds.length === 0) return [];

    const media: any[] = [];

    for (const convId of sharedConversationIds) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", convId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        // Fetch a little extra to account for filtering
        .take(limit * 3);

      for (const msg of messages) {
        const itemType = getMediaType(msg);
        if (!itemType) continue;

        const storageId = (msg.metadata as any)?.storageId as Id<"_storage"> | undefined;
        const storageIds = ((msg.metadata as any)?.storageIds as string[] | undefined) ?? [];
        const candidateId = storageId ?? (storageIds[0] as Id<"_storage"> | undefined);

        let url: string | undefined;
        if (candidateId) {
          try {
            url = await ctx.storage.getUrl(candidateId);
          } catch {
            // Ignore URL errors; still return metadata so UI can render filename
          }
        }

        media.push({
          id: msg._id,
          conversationId: convId,
          type: itemType,
          url,
          fileName: (msg.metadata as any)?.fileName,
          mimeType: (msg.metadata as any)?.mimeType,
          createdAt: msg._creationTime,
        });
      }
    }

    return media
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit);
  },
});

/**
 * Get shared files with a member (placeholder - returns empty for now)
 */
export const getSharedFiles = query({
  args: {
    memberId: v.optional(v.string()),
    conversationId: v.optional(v.id("conversations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { memberId, conversationId, limit = 20 }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const sharedConversationIds = await getSharedConversationIds(
      ctx,
      currentUser._id,
      memberId,
      conversationId
    );
    if (sharedConversationIds.length === 0) return [];

    const files: any[] = [];

    for (const convId of sharedConversationIds) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", convId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        .take(limit * 3);

      for (const msg of messages) {
        if (getMediaType(msg)) {
          // Skip messages that are already classified as media attachments
          continue;
        }
        // Treat anything that is not a pure text message as a file if it has metadata
        const hasFileMeta = Boolean((msg.metadata as any)?.fileName || (msg.metadata as any)?.fileSize);
        if (msg.type === "file" || hasFileMeta) {
          files.push({
            id: msg._id,
            conversationId: convId,
            name: (msg.metadata as any)?.fileName ?? msg.content ?? "Attachment",
            size: (msg.metadata as any)?.fileSize ?? undefined,
            type: (msg.metadata as any)?.mimeType ?? "file",
            createdAt: msg._creationTime,
          });
        }
      }
    }

    return files
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit);
  },
});

/**
 * Get shared links with a member (placeholder - returns empty for now)
 */
export const getSharedLinks = query({
  args: {
    memberId: v.optional(v.string()),
    conversationId: v.optional(v.id("conversations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { memberId, conversationId, limit = 20 }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const sharedConversationIds = await getSharedConversationIds(
      ctx,
      currentUser._id,
      memberId,
      conversationId
    );
    if (sharedConversationIds.length === 0) return [];

    const links: any[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;

    for (const convId of sharedConversationIds) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", convId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        .take(limit * 5);

      for (const msg of messages) {
        const matches = (msg.content || "").match(urlRegex);
        if (!matches) continue;

        for (const url of matches) {
          links.push({
            id: `${msg._id}-${url}`,
            conversationId: convId,
            url,
            createdAt: msg._creationTime,
            title: (msg.metadata as any)?.title ?? undefined,
          });
        }
      }
    }

    return links
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit);
  },
});

/**
 * Get common groups with a member (placeholder - returns empty for now)
 */
export const getCommonGroups = query({
  args: {
    memberId: v.optional(v.string()),
  },
  handler: async (ctx, { memberId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || !memberId) return [];

    const sharedConversationIds = await getSharedConversationIds(
      ctx,
      currentUser._id,
      memberId,
      undefined
    );
    if (sharedConversationIds.length === 0) return [];

    const groups: any[] = [];

    for (const convId of sharedConversationIds) {
      const conversation = await ctx.db.get(convId);
      if (!conversation || (conversation as any).type !== "group") continue;

      const participants = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation", (q) => q.eq("conversationId", convId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      groups.push({
        id: convId,
        name: (conversation as any).name ?? "Group",
        avatar: (conversation as any).metadata?.avatar ?? undefined,
        members: participants.length,
      });
    }

    return groups;
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

// ============================================================================
// Helpers
// ============================================================================

/**
 * Determine shared conversation IDs between the current user and another member.
 * Optionally constrain to a specific conversationId (and verify participation).
 */
async function getSharedConversationIds(
  ctx: any,
  currentUserId: Id<"users">,
  memberId?: string | null,
  explicitConversationId?: Id<"conversations">,
): Promise<Id<"conversations">[]> {
  if (explicitConversationId) {
    const participants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", explicitConversationId))
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();

    const hasCurrent = participants.some((p: any) => String(p.userId) === String(currentUserId));
    if (!hasCurrent) return [];

    if (memberId) {
      const hasMember = participants.some((p: any) => String(p.userId) === String(memberId));
      if (!hasMember) return [];
    }

    return [explicitConversationId];
  }

  if (!memberId) return [];

  let memberConvIds: Id<"conversations">[] = [];
  try {
    const memberParticipations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", memberId as Id<"users">))
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();
    memberConvIds = memberParticipations.map((p: any) => p.conversationId);
  } catch {
    return [];
  }

  const currentParticipations = await ctx.db
    .query("conversationParticipants")
    .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .collect();

  const memberConvSet = new Set(memberConvIds.map((id) => String(id)));
  return currentParticipations
    .map((p: any) => p.conversationId)
    .filter((id: any) => memberConvSet.has(String(id)));
}

function getMediaType(message: any): "image" | "video" | null {
  if (message.type === "image") return "image";
  const mime = (message.metadata as any)?.mimeType as string | undefined;
  if (!mime) return null;
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return null;
}

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
      // Check for existing Contactship
      const existing = await ctx.db
        .query("socialContacts")
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
        .query("socialContacts")
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

      // Create new blocked Contactship
      return await ctx.db.insert("socialContacts", {
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
        .query("socialContacts")
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
        .query("socialContacts")
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

    return true;
  },
});
