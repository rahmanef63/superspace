import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { requirePermission, canPermission, getExistingUserId, ensureUser, requireActiveMembership } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";

export const createDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    parentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    await requirePermission(ctx, args.workspaceId, PERMS.DOCUMENTS_CREATE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const documentId = await ctx.db.insert("documents", {
      workspaceId: args.workspaceId,
      title: args.title,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "",
              },
            ],
          },
        ],
      }),
      isPublic: false,
      createdBy: userId,

    });

    return documentId;
  },
});

export const getWorkspaceDocuments = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    try {
      await requireActiveMembership(ctx, args.workspaceId);
    } catch {
      return [];
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Get author information for each document
    const documentsWithAuthors = await Promise.all(
      documents.map(async (document) => {
        const author = document.createdBy ? await ctx.db.get(document.createdBy) : null;
        return {
          ...document,
          author,
        };
      })
    );

    return documentsWithAuthors;
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) return null;
    
    // Allow public docs without membership
    if (!document.isPublic) {
      try {
        await requireActiveMembership(ctx, document.workspaceId);
      } catch {
        return null;
      }
    }

    return document;
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    emoji: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    await requirePermission(ctx, document.workspaceId, PERMS.DOCUMENTS_EDIT);

    const updates: any = {
      lastEditedBy: userId,
      lastEditedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.emoji !== undefined) updates.emoji = args.emoji;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;

    await ctx.db.patch(args.documentId, updates);
  },
});

export const searchDocuments = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await requireActiveMembership(ctx, args.workspaceId);
    } catch {
      return [];
    }

    const results = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) =>
        q.search("title", args.query).eq("workspaceId", args.workspaceId)
      )
      .take(20);

    return results;
  },
});

export const togglePublic = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    await requirePermission(ctx, document.workspaceId, PERMS.DOCUMENTS_MANAGE);

    await ctx.db.patch(args.documentId, {
      isPublic: !document.isPublic,
    });
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Allow if creator; otherwise require permission
    if (document.createdBy !== userId) {
      const allowed = await canPermission(ctx, document.workspaceId, PERMS.DOCUMENTS_DELETE);
      if (!allowed) throw new Error("Not authorized to delete this document");
    }

    await ctx.db.delete(args.documentId);
  },
});
