import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser } from "../../auth/helpers";

/**
 * Create a new comment
 */
export const createComment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.union(
      v.literal("document"),
      v.literal("page"),
      v.literal("task"),
      v.literal("project"),
      v.literal("file"),
      v.literal("dbRow"),
    ),
    entityId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    mentions: v.optional(v.array(v.id("users"))),
    attachments: v.optional(v.array(v.id("_storage"))),
    position: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const commentId = await ctx.db.insert("comments", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      authorId: userId,
      content: args.content,
      parentId: args.parentId,
      isResolved: false,
      mentions: args.mentions,
      attachments: args.attachments,
      position: args.position,
    });

    // TODO: Create notifications for mentions
    if (args.mentions && args.mentions.length > 0) {
      for (const mentionedUserId of args.mentions) {
        await ctx.db.insert("systemNotifications", {
          workspaceId: args.workspaceId,
          userId: mentionedUserId,
          type: "mention",
          title: "You were mentioned",
          message: `You were mentioned in a comment on ${args.entityType}`,
          entityType: args.entityType,
          entityId: args.entityId,
          isRead: false,
          actorId: userId,
        });
      }
    }

    return commentId;
  },
});

/**
 * Update a comment
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.authorId !== userId) {
      throw new Error("Not authorized to edit this comment");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      metadata: {
        edited: true,
        editedAt: Date.now(),
      },
    });

    return null;
  },
});

/**
 * Delete a comment
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.authorId !== userId) {
      throw new Error("Not authorized to delete this comment");
    }

    // Delete all replies first
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    await ctx.db.delete(args.commentId);

    return null;
  },
});

/**
 * Resolve a comment
 */
export const resolveComment = mutation({
  args: {
    commentId: v.id("comments"),
    resolved: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    await ctx.db.patch(args.commentId, {
      isResolved: args.resolved,
    });

    return null;
  },
});
