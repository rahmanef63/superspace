import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId } from "../auth";

const commentFormat = v.union(v.literal("plain"), v.literal("markdown"), v.literal("html"));

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await getUserByExternalId(ctx, identity.subject);
  if (!user) throw new Error("User not found");
  return user;
}

export const addComment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.id("_table"),
    content: v.string(),
    format: v.optional(commentFormat),
    threadId: v.optional(v.id("comments")),
    replyToId: v.optional(v.id("comments")),
    mentions: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const commentId = await ctx.db.insert("comments", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      threadId: args.threadId,
      replyToId: args.replyToId,
      content: args.content,
      format: args.format,
      mentions: args.mentions ?? [],
      tags: args.tags ?? [],
      attachments: args.attachments ?? [],
      isEdited: false,
      isDeleted: false,
      isResolved: false,
      isPinned: false,
      isReported: false,
      reactions: [],
      createdAt: now,
      createdBy: user._id,
      updatedAt: undefined,
      updatedBy: undefined,
    });

    // minimal thread summary maintenance
    const existingThread = await ctx.db
      .query("commentThreads")
      .filter((q) => q.eq(q.field("entityType"), args.entityType))
      .filter((q) => q.eq(q.field("entityId"), args.entityId))
      .first();

    if (existingThread) {
      await ctx.db.patch(existingThread._id, {
        commentCount: existingThread.commentCount + 1,
        participantCount: existingThread.participantCount + 1,
        lastCommentAt: now,
        lastCommentBy: user._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("commentThreads", {
        workspaceId: args.workspaceId,
        entityType: args.entityType,
        entityId: args.entityId,
        commentCount: 1,
        participantCount: 1,
        lastCommentAt: now,
        lastCommentBy: user._id,
        isResolved: false,
        resolvedAt: undefined,
        resolvedBy: undefined,
        priority: "normal",
        assignees: [],
        tags: [],
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, commentId };
  },
});

export const editComment = mutation({
  args: {
    commentId: v.id("comments"),
    workspaceId: v.id("workspaces"),
    content: v.string(),
    format: v.optional(commentFormat),
    mentions: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.workspaceId !== args.workspaceId) throw new Error("Comment not found");
    if (comment.createdBy !== user._id) throw new Error("Unauthorized");
    if (comment.isDeleted) throw new Error("Cannot edit deleted comment");

    await ctx.db.patch(args.commentId, {
      content: args.content,
      format: args.format ?? comment.format,
      mentions: args.mentions ?? comment.mentions,
      tags: args.tags ?? comment.tags,
      isEdited: true,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });
    return null;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments"), workspaceId: v.id("workspaces") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.workspaceId !== args.workspaceId) throw new Error("Comment not found");
    if (comment.createdBy !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.commentId, { isDeleted: true, updatedAt: Date.now(), updatedBy: user._id });
    return null;
  },
});

export const listComments = query({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.id("_table"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const results = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("entityType"), args.entityType))
      .filter((q) => q.eq(q.field("entityId"), args.entityId))
      .collect();

    return results.filter((c) => c.workspaceId === args.workspaceId && !c.isDeleted);
  },
});
