import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser } from "../../auth/helpers";
import { internal } from "../../_generated/api";

/**
 * Create a new support ticket
 */
export const createTicket = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    customerId: v.id("users"),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    )),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("supportTickets"),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate ticket number (simple sequential)
    const existingTickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const ticketNumber = `TICKET-${String(existingTickets.length + 1).padStart(6, "0")}`;

    // Create conversation for the ticket
    const conversationId = await ctx.db.insert("conversations", {
      name: args.title,
      type: "group",
      workspaceId: args.workspaceId,
      createdBy: userId,
      isActive: true,
      metadata: {
        description: `Support ticket: ${ticketNumber}`,
      },
    });

    // Add participants (customer and creator)
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: args.customerId,
      role: "member",
      joinedAt: Date.now(),
      isActive: true,
    });

    if (args.customerId !== userId) {
      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId,
        role: "admin",
        joinedAt: Date.now(),
        isActive: true,
      });
    }

    // Create ticket
    const ticketId = await ctx.db.insert("supportTickets", {
      workspaceId: args.workspaceId,
      ticketNumber,
      title: args.title,
      description: args.description,
      status: "open",
      priority: args.priority || "medium",
      customerId: args.customerId,
      category: args.category,
      tags: args.tags,
      conversationId,
      createdBy: userId,
    });

    // Create initial message
    await ctx.db.insert("messages", {
      conversationId,
      senderId: args.customerId,
      content: args.description,
      type: "text",
    });

    return ticketId;
  },
});

/**
 * Update ticket status
 */
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("pending"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const updates: any = { status: args.status };

    if (args.status === "resolved" && !ticket.resolvedAt) {
      updates.resolvedAt = Date.now();
    }

    if (args.status === "closed" && !ticket.closedAt) {
      updates.closedAt = Date.now();
    }

    await ctx.db.patch(args.ticketId, updates);

    return null;
  },
});

/**
 * Assign ticket to a user
 */
export const assignTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    assigneeId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    await ctx.db.patch(args.ticketId, {
      assignedTo: args.assigneeId,
    });

    // Add assignee to conversation
    const existingParticipant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.assigneeId).eq("conversationId", ticket.conversationId)
      )
      .first();

    if (!existingParticipant) {
      await ctx.db.insert("conversationParticipants", {
        conversationId: ticket.conversationId,
        userId: args.assigneeId,
        role: "admin",
        joinedAt: Date.now(),
        isActive: true,
      });
    }

    return null;
  },
});

/**
 * Add internal note to ticket
 */
export const addInternalNote = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    note: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const internalNotes = ticket.metadata?.internalNotes || [];
    internalNotes.push({
      note: args.note,
      authorId: userId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.ticketId, {
      metadata: {
        ...ticket.metadata,
        internalNotes,
      },
    });

    return null;
  },
});

/**
 * Update ticket details
 */
export const updateTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    title: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    )),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.ticketId, updates);

    return null;
  },
});
