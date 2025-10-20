import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { getExistingUserId } from "../../auth/helpers";

/**
 * Get all customers in a workspace
 */
export const getWorkspaceCustomers = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("lead"),
      v.literal("prospect"),
      v.literal("customer"),
      v.literal("inactive"),
    )),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const { status } = args;
    const customersQuery =
      status !== undefined
        ? ctx.db
            .query("crmCustomers")
            .withIndex("by_status", (q) => q.eq("status", status))
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        : ctx.db
            .query("crmCustomers")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const customers = await customersQuery.collect();

    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        const assignee = customer.assignedTo ? await ctx.db.get(customer.assignedTo) : null;
        const user = customer.userId ? await ctx.db.get(customer.userId) : null;

        return {
          ...customer,
          assignee,
          user,
        };
      })
    );

    return customersWithDetails;
  },
});

/**
 * Get a single customer with full details
 */
export const getCustomer = query({
  args: {
    customerId: v.id("crmCustomers"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const customer = await ctx.db.get(args.customerId);
    if (!customer) return null;

    const assignee = customer.assignedTo ? await ctx.db.get(customer.assignedTo) : null;
    const user = customer.userId ? await ctx.db.get(customer.userId) : null;

    // Get conversation if exists
    let conversation: Doc<"conversations"> | null = null;
    let messages: Array<Doc<"messages"> & { author: Doc<"users"> | null }> = [];

    const conversationId = customer.conversationId;

    if (conversationId) {
      conversation = await ctx.db.get(conversationId);

      if (conversation) {
        const conversationMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .order("desc")
          .take(50);

        messages = await Promise.all(
          conversationMessages.map(async (msg) => {
            const author = msg.senderId ? await ctx.db.get(msg.senderId) : null;
            return {
              ...msg,
              author,
            };
          })
        );
      }
    }

    return {
      ...customer,
      assignee,
      user,
      conversation,
      messages: messages.reverse(),
    };
  },
});

/**
 * Get customers assigned to current user
 */
export const getMyCustomers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const customers = await ctx.db
      .query("crmCustomers")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    return customers;
  },
});

/**
 * Search customers
 */
export const searchCustomers = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const customers = await ctx.db
      .query("crmCustomers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const searchLower = args.query.toLowerCase();
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.company && c.company.toLowerCase().includes(searchLower))
    );

    return filtered;
  },
});
