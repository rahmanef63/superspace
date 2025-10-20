import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId } from "../../auth/helpers";

/**
 * Get all tickets in a workspace
 */
export const getWorkspaceTickets = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("pending"),
      v.literal("resolved"),
      v.literal("closed"),
    )),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("supportTickets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    if (args.status) {
      query = ctx.db
        .query("supportTickets")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId));
    }

    const tickets = await query.collect();

    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const customer = await ctx.db.get(ticket.customerId);
        const assignee = ticket.assignedTo ? await ctx.db.get(ticket.assignedTo) : null;
        const conversation = await ctx.db.get(ticket.conversationId);

        return {
          ...ticket,
          customer,
          assignee,
          conversation,
        };
      })
    );

    return ticketsWithDetails.sort((a, b) =>
      (b._creationTime || 0) - (a._creationTime || 0)
    );
  },
});

/**
 * Get a single ticket with full details
 */
export const getTicket = query({
  args: {
    ticketId: v.id("supportTickets"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;

    const customer = await ctx.db.get(ticket.customerId);
    const assignee = ticket.assignedTo ? await ctx.db.get(ticket.assignedTo) : null;
    const conversation = await ctx.db.get(ticket.conversationId);

    // Get conversation messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", ticket.conversationId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .take(50);

    const messagesWithAuthors = await Promise.all(
      messages.map(async (msg) => {
        const author = msg.senderId ? await ctx.db.get(msg.senderId) : null;
        return {
          ...msg,
          author,
        };
      })
    );

    return {
      ...ticket,
      customer,
      assignee,
      conversation,
      messages: messagesWithAuthors.reverse(),
    };
  },
});

/**
 * Get tickets assigned to current user
 */
export const getMyTickets = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const customer = await ctx.db.get(ticket.customerId);
        return {
          ...ticket,
          customer,
        };
      })
    );

    return ticketsWithDetails;
  },
});

/**
 * Get customer tickets
 */
export const getCustomerTickets = query({
  args: {
    customerId: v.id("users"),
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const tickets = await ctx.db
      .query("supportTickets")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    return tickets.sort((a, b) =>
      (b._creationTime || 0) - (a._creationTime || 0)
    );
  },
});
