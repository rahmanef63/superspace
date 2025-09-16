import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getExistingUserId, ensureUser, requireActiveMembership } from "../auth/helpers";

// Get comments for a document
export const getDocumentComments = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const document = await ctx.db.get(args.documentId);
    if (!document) return [];

    // Check workspace membership unless document is public
    if (!document.isPublic) {
      try {
        await requireActiveMembership(ctx, document.workspaceId);
      } catch {
        return [];
      }
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    // Get user info for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          user: user ? {
            name: user.name,
            email: user.email,
            image: user.image,
          } : null,
        };
      })
    );

    return commentsWithUsers;
  },
});

// Add a comment to a document
export const addComment = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    position: v.optional(v.object({
      from: v.number(),
      to: v.number(),
    })),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Check workspace membership unless document is public
    if (!document.isPublic) {
      await requireActiveMembership(ctx, document.workspaceId);
    }

    const commentId = await ctx.db.insert("comments", {
      documentId: args.documentId,
      authorId: userId,
      content: args.content,
      position: args.position ? {
        start: args.position.from,
        end: args.position.to,
      } : undefined,
      isResolved: false,
      parentId: args.parentId,
    });

    return commentId;
  },
});

// Resolve a comment
export const resolveComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    // Check document access
    const document = await ctx.db.get(comment.documentId);
    if (!document) throw new Error("Document not found");

    if (!document.isPublic) {
      await requireActiveMembership(ctx, document.workspaceId);
    }

    await ctx.db.patch(args.commentId, {
      isResolved: true,
    });
  },
});
