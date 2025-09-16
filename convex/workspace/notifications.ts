import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, getExistingUserId } from "../auth/helpers";
import { Id } from "../_generated/dataModel";

// Get user notifications
export const getUserNotifications = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, _args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // For now, return empty array to prevent errors
    // TODO: Implement full notification system
    return [] as Array<{
      _id: Id<"notifications">;
      title: string;
      message: string;
      type: string;
      isRead: boolean;
      _creationTime: number;
    }>;
  },
});

// Create notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    type: v.union(
      v.literal("message"),
      v.literal("invitation"),
      v.literal("document"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      workspaceId: args.workspaceId,
      type: args.type,
      title: args.title,
      message: args.message,
      actionUrl: args.actionUrl,
      metadata: args.metadata,
      isRead: false,
      createdBy: currentUserId,
    });
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return args.notificationId;
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    await Promise.all(
      notifications.map(notification =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );

    return notifications.length;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});
