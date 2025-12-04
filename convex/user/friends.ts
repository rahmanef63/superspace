import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, getExistingUserId } from "../auth/helpers";

// Get user's friends
export const getUserFriends = query({
  args: {},
  handler: async (ctx) => {
    // Queries must not write; resolve existing user id only.
    const userId = await getExistingUserId(ctx);
    if (!userId) return [] as any;

    // Get current user to check for duplicates
    const currentUser = await ctx.db.get(userId);
    const currentUserEmail = currentUser?.email;

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const reverseFriendships = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get friend details
    const friends = await Promise.all([
      ...friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.user2Id);
        return { ...friendship, friend };
      }),
      ...reverseFriendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.user1Id);
        return { ...friendship, friend };
      }),
    ]);

    // Filter out: null friends, self (by ID), and duplicates of self (by email)
    return friends.filter(f => 
      f.friend && 
      f.friend._id !== userId &&
      f.friend.email !== currentUserEmail
    );
  },
});

// Send friend request
export const sendFriendRequest = mutation({
  args: {
    receiverId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const senderId = await ensureUser(ctx);
    if (!senderId) throw new Error("Not authenticated");

    if (senderId === args.receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender_receiver", (q) => q.eq("senderId", senderId).eq("receiverId", args.receiverId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Check if they are already friends
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => q.eq("user1Id", senderId).eq("user2Id", args.receiverId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => q.eq("user1Id", args.receiverId).eq("user2Id", senderId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingFriendship || reverseFriendship) {
      throw new Error("Already friends");
    }

    // Create friend request
    const requestId = await ctx.db.insert("friendRequests", {
      senderId,
      receiverId: args.receiverId,
      status: "pending",
      message: args.message,
      sentAt: Date.now(),
    });

    return requestId;
  },
});

// Accept friend request
export const acceptFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Friend request not found");

    if (request.receiverId !== userId) {
      throw new Error("Not authorized");
    }

    if (request.status !== "pending") {
      throw new Error("Friend request is not pending");
    }

    // Create friendship
    await ctx.db.insert("friendships", {
      user1Id: request.senderId,
      user2Id: request.receiverId,
      status: "active",
      createdAt: Date.now(),
    });

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    return args.requestId;
  },
});

// Decline friend request
export const declineFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Friend request not found");

    if (request.receiverId !== userId) {
      throw new Error("Not authorized");
    }

    if (request.status !== "pending") {
      throw new Error("Friend request is not pending");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return args.requestId;
  },
});

// Get pending friend requests
export const getPendingFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx);
    if (!userId) return [] as any;

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get sender details
    const requestsWithSenders = await Promise.all(
      requests.map(async (request) => {
        const sender = await ctx.db.get(request.senderId);
        return { ...request, sender };
      })
    );

    return requestsWithSenders;
  },
});

// Remove friend
export const removeFriend = mutation({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find friendship
    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => q.eq("user1Id", userId).eq("user2Id", args.friendId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => q.eq("user1Id", args.friendId).eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const friendshipToRemove = friendship || reverseFriendship;
    if (!friendshipToRemove) {
      throw new Error("Friendship not found");
    }

    // Mark as inactive
    await ctx.db.patch(friendshipToRemove._id, {
      status: "blocked", // or create a "removed" status
    });

    return args.friendId;
  },
});

// Get sent friend requests
export const getSentFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx);
    if (!userId) return [] as any;

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithReceivers = await Promise.all(
      requests.map(async (request) => {
        const receiver = await ctx.db.get(request.receiverId);
        return { ...request, receiver };
      })
    );

    return requestsWithReceivers;
  },
});
