import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser } from "../../auth/helpers";

/**
 * Create a notification
 */
export const createNotification = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    type: v.union(
      v.literal("system"),
      v.literal("mention"),
      v.literal("task"),
      v.literal("document"),
      v.literal("project"),
      v.literal("comment"),
    ),
    title: v.string(),
    message: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    actorId: v.optional(v.id("users")),
  },
  returns: v.id("systemNotifications"),
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const notificationId = await ctx.db.insert("systemNotifications", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      entityType: args.entityType,
      entityId: args.entityId,
      actionUrl: args.actionUrl,
      isRead: false,
      actorId: args.actorId || currentUserId,
    });

    return notificationId;
  },
});

/**
 * Mark notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("systemNotifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    if (notification.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    return null;
  },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unreadNotifications = await ctx.db
      .query("systemNotifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }

    return null;
  },
});

/**
 * Delete notification
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("systemNotifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    if (notification.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.notificationId);

    return null;
  },
});
