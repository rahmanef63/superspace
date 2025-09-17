import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { ensureUser, getExistingUserId } from "../../auth/helpers";
import { Doc, Id } from "../../_generated/dataModel";

type Document = Doc<"documents">;

const sortByLastModifiedDesc = (a: Document, b: Document) => {
  const aTime = a.lastModified ?? a._creationTime;
  const bTime = b.lastModified ?? b._creationTime;
  return bTime - aTime;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const [privateDocuments, publicDocuments] = await Promise.all([
      ctx.db
        .query("documents")
        .withIndex("by_creator", (q) => q.eq("createdBy", userId))
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
        .collect(),
    ]);

    const docsById = new Map<Id<"documents">, Document>();
    for (const doc of privateDocuments) {
      docsById.set(doc._id, doc);
    }
    for (const doc of publicDocuments) {
      if (!docsById.has(doc._id)) {
        docsById.set(doc._id, doc);
      }
    }

    return Array.from(docsById.values()).sort(sortByLastModifiedDesc);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const trimmedQuery = args.query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const [userResults, publicResults] = await Promise.all([
      ctx.db
        .query("documents")
        .withSearchIndex("search_documents", (q) =>
          q.search("title", trimmedQuery).eq("createdBy", userId)
        )
        .take(10),
      ctx.db
        .query("documents")
        .withSearchIndex("search_documents", (q) =>
          q.search("title", trimmedQuery).eq("isPublic", true)
        )
        .take(10),
    ]);

    const deduped = new Map<Id<"documents">, Document>();
    for (const doc of userResults) {
      deduped.set(doc._id, doc);
    }
    for (const doc of publicResults) {
      if (!deduped.has(doc._id)) {
        deduped.set(doc._id, doc);
      }
    }

    return Array.from(deduped.values());
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    const document = await ctx.db.get(args.id);

    if (!document) {
      return null;
    }

    if (!document.isPublic && document.createdBy !== userId) {
      return null;
    }

    return document;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    isPublic: v.boolean(),
    workspaceId: v.id("workspaces"),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    return await ctx.db.insert("documents", {
      title: args.title,
      isPublic: args.isPublic,
      createdBy: userId,
      workspaceId: args.workspaceId,
      content: args.content,
      lastModified: Date.now(),
    });
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      lastModified: Date.now(),
    });
  },
});

export const togglePublic = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      isPublic: !document.isPublic,
      lastModified: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: Partial<Document> = {
      lastModified: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.content !== undefined) {
      updates.content = args.content;
    }
    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const getDocument = get;
export const createDocument = create;
export const updateDocument = update;

export const getWorkspaceDocuments = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const visibleDocuments = documents.filter(
      (doc) => doc.isPublic || doc.createdBy === userId
    );

    const withAuthor = await Promise.all(
      visibleDocuments.map(async (doc) => {
        const author = await ctx.db.get(doc.createdBy);
        return {
          ...doc,
          author: author
            ? {
                name: author.name ?? undefined,
                image: author.image ?? undefined,
              }
            : undefined,
        };
      })
    );

    return withAuthor.sort(sortByLastModifiedDesc);
  },
});

export const searchDocuments = query({
  args: { workspaceId: v.id("workspaces"), query: v.string() },
  handler: async (ctx, { workspaceId, query: rawQuery }) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) {
      return [];
    }

    const results = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) =>
        q.search("title", trimmedQuery).eq("workspaceId", workspaceId)
      )
      .take(20);

    const visible = results.filter(
      (doc) => doc.isPublic || doc.createdBy === userId
    );

    const withAuthor = await Promise.all(
      visible.map(async (doc) => {
        const author = await ctx.db.get(doc.createdBy);
        return {
          ...doc,
          author: author
            ? {
                name: author.name ?? undefined,
                image: author.image ?? undefined,
              }
            : undefined,
        };
      })
    );

    return withAuthor.sort(sortByLastModifiedDesc);
  },
});





