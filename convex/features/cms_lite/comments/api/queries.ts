import { query } from "../../_generated";
import { v } from "convex/values";

/**
 * Get a comment thread and its comments
 */
export const getThread = query({
  args: {
    threadId: v.id("cmsLiteCommentThreads"),
  },
  returns: v.union(
    v.null(),
    v.object({
      thread: v.object({
        _id: v.id("cmsLiteCommentThreads"),
        _creationTime: v.number(),
        workspaceId: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        status: v.string(),
        title: v.optional(v.string()),
        commentCount: v.number(),
        lastCommentAt: v.number(),
        lastCommentBy: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      }),
      comments: v.array(
        v.object({
          _id: v.id("cmsLiteComments"),
          _creationTime: v.number(),
          threadId: v.id("cmsLiteCommentThreads"),
          authorId: v.string(),
          authorName: v.string(),
          content: v.string(),
          replyToId: v.optional(v.union(v.id("cmsLiteComments"), v.null())),
          status: v.string(),
          reactions: v.optional(
            v.array(
              v.object({
                type: v.string(),
                userId: v.string(),
                timestamp: v.number(),
              }),
            ),
          ),
          attachments: v.optional(
            v.array(
              v.object({
                fileId: v.string(),
                fileName: v.string(),
                fileType: v.string(),
                fileSize: v.number(),
              }),
            ),
          ),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      return null;
    }

    // Get all comments in the thread
    const comments = await ctx.db
      .query("cmsLiteComments")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    return {
      thread,
      comments,
    };
  },
});

/**
 * List comment threads for an entity
 */
export const listThreads = query({
  args: {
    workspaceId: v.string(),
    entityType: v.string(),
    entityId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("cmsLiteCommentThreads"),
      _creationTime: v.number(),
      workspaceId: v.string(),
      entityType: v.string(),
      entityId: v.string(),
      status: v.string(),
      title: v.optional(v.string()),
      commentCount: v.number(),
      lastCommentAt: v.number(),
      lastCommentBy: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  ),
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("cmsLiteCommentThreads")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId),
      )
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .collect();

    return threads;
  },
});

/**
 * Get unread mentions for current user
 */
export const getUnreadMentions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("cmsLiteCommentMentions"),
      _creationTime: v.number(),
      commentId: v.id("cmsLiteComments"),
      userId: v.string(),
      notified: v.boolean(),
      comment: v.object({
        _id: v.id("cmsLiteComments"),
        threadId: v.id("cmsLiteCommentThreads"),
        content: v.string(),
        authorName: v.string(),
      }),
      thread: v.object({
        _id: v.id("cmsLiteCommentThreads"),
        entityType: v.string(),
        entityId: v.string(),
        title: v.optional(v.string()),
      }),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get unread mentions
    const mentions = await ctx.db
      .query("cmsLiteCommentMentions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("notified"), false))
      .collect();

    // Load associated comments and threads
    const results = [];
    for (const mention of mentions) {
      const comment = await ctx.db.get(mention.commentId);
      if (!comment) continue;

      const thread = await ctx.db.get(comment.threadId);
      if (!thread) continue;

      results.push({
        ...mention,
        comment: {
          _id: comment._id,
          threadId: comment.threadId,
          content: comment.content,
          authorName: comment.authorName,
        },
        thread: {
          _id: thread._id,
          entityType: thread.entityType,
          entityId: thread.entityId,
          title: thread.title,
        },
      });
    }

    return results;
  },
});
