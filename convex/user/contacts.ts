import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, getExistingUserId } from "../auth/helpers";

// Get user's social contacts
export const getUserContacts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [] as any;

    const currentUser = await ctx.db.get(userId);
    const currentUserEmail = currentUser?.email;

    // Get contacts where user is user1
    const contacts1 = await ctx.db
      .query("socialContacts")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get contacts where user is user2
    const contacts2 = await ctx.db
      .query("socialContacts")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get contact details
    const allContacts = await Promise.all([
      ...contacts1.map(async (c) => {
        const contact = await ctx.db.get(c.user2Id);
        return { ...c, contact };
      }),
      ...contacts2.map(async (c) => {
        const contact = await ctx.db.get(c.user1Id);
        return { ...c, contact };
      }),
    ]);

    // Filter out self and duplicates
    return allContacts.filter(f =>
      f.contact &&
      f.contact._id !== userId &&
      f.contact.email !== currentUserEmail
    );
  },
});

// Send contact request
export const sendContactRequest = mutation({
  args: {
    receiverId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const senderId = await ensureUser(ctx);
    if (!senderId) throw new Error("Not authenticated");

    if (senderId === args.receiverId) {
      throw new Error("Cannot send contact request to yourself");
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("socialContactRequests")
      .withIndex("by_sender_receiver", (q) => q.eq("senderId", senderId).eq("receiverId", args.receiverId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("Contact request already sent");
    }

    // Check if already contacts
    const existingContact = await ctx.db
      .query("socialContacts")
      .withIndex("by_users", (q) => q.eq("user1Id", senderId).eq("user2Id", args.receiverId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const reverseContact = await ctx.db
      .query("socialContacts")
      .withIndex("by_users", (q) => q.eq("user1Id", args.receiverId).eq("user2Id", senderId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingContact || reverseContact) {
      throw new Error("Already contacts");
    }

    // Create contact request
    const requestId = await ctx.db.insert("socialContactRequests", {
      senderId,
      receiverId: args.receiverId,
      status: "pending",
      message: args.message,
      sentAt: Date.now(),
    });

    return requestId;
  },
});

// Accept contact request
export const acceptContactRequest = mutation({
  args: { requestId: v.id("socialContactRequests") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Contact request not found");

    if (request.receiverId !== userId) {
      throw new Error("Not authorized");
    }

    if (request.status !== "pending") {
      throw new Error("Contact request is not pending");
    }

    // Create contact
    await ctx.db.insert("socialContacts", {
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

// Decline contact request
export const declineContactRequest = mutation({
  args: { requestId: v.id("socialContactRequests") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Contact request not found");

    if (request.receiverId !== userId) {
      throw new Error("Not authorized");
    }

    if (request.status !== "pending") {
      throw new Error("Contact request is not pending");
    }

    await ctx.db.patch(args.requestId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return args.requestId;
  },
});

// Get pending contact requests
export const getPendingContactRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx);
    if (!userId) return [] as any;

    const requests = await ctx.db
      .query("socialContactRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithSenders = await Promise.all(
      requests.map(async (request) => {
        const sender = await ctx.db.get(request.senderId);
        return { ...request, sender };
      })
    );

    return requestsWithSenders;
  },
});

// Remove contact
export const removeContact = mutation({
  args: { contactId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find contact
    const contact1 = await ctx.db
      .query("socialContacts")
      .withIndex("by_users", (q) => q.eq("user1Id", userId).eq("user2Id", args.contactId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const contact2 = await ctx.db
      .query("socialContacts")
      .withIndex("by_users", (q) => q.eq("user1Id", args.contactId).eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const contactToRemove = contact1 || contact2;
    if (!contactToRemove) {
      throw new Error("Contact not found");
    }

    // Mark as blocked
    await ctx.db.patch(contactToRemove._id, {
      status: "blocked",
    });

    return args.contactId;
  },
});

// Get sent contact requests
export const getSentContactRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx);
    if (!userId) return [] as any;

    const requests = await ctx.db
      .query("socialContactRequests")
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
