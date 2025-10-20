import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId } from "../../auth/helpers";

/**
 * Get notifications for current user
 */
export const getMyNotifications = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.union(
      v.literal("system"),
      v.literal("mention"),
      v.literal("task"),
      v.literal("document"),
      v.literal("project"),
      v.literal("comment"),
    )),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("systemNotifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId));

    if (args.unreadOnly) {
      query = ctx.db
        .query("systemNotifications")
        .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
        .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId));
    }

    const notifications = await query
      .order("desc")
      .take(args.limit || 50);

    // Filter by type if specified
    let filtered = notifications;
    if (args.type) {
      filtered = notifications.filter(n => n.type === args.type);
    }

    // Get actor information
    const notificationsWithActors = await Promise.all(
      filtered.map(async (notification) => {
        const actor = notification.actorId ? await ctx.db.get(notification.actorId) : null;
        return {
          ...notification,
          actor,
        };
      })
    );

    return notificationsWithActors;
  },
});

/**
 * Get unread notification count
 */
export const getUnreadCount = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("systemNotifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    return unread.length;
  },
});

/**
 * Get activity feed (all notifications formatted as feed items)
 */
export const getActivityFeed = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const notifications = await ctx.db
      .query("systemNotifications")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit || 20);

    const notificationsWithActors = await Promise.all(
      notifications.map(async (notification) => {
        const actor = notification.actorId ? await ctx.db.get(notification.actorId) : null;
        return {
          ...notification,
          actor,
        };
      })
    );

    return notificationsWithActors;
  },
});
