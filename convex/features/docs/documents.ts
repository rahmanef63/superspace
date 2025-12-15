import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { ensureUser, getExistingUserId, requireActiveMembership, hasPermission, requirePermission } from "../../auth/helpers";
import { Doc, Id } from "../../_generated/dataModel";
import { PERMS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

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
    parentId: v.optional(v.union(v.id("documents"), v.null())),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.DOCUMENTS_CREATE
    );
    const userId = membership.userId; // Standardize on membership user

    let parentId: Id<"documents"> | undefined;
    if (args.parentId !== undefined) {
      if (args.parentId === null) {
        parentId = undefined;
      } else {
        const parent = await ctx.db.get(args.parentId);
        if (!parent) {
          throw new Error("Parent document not found");
        }
        if (parent.workspaceId !== args.workspaceId) {
          throw new Error("Parent document must belong to the same workspace");
        }
        // Access control for parent matching create
        if (!parent.isPublic && parent.createdBy !== userId) {
          // Allow if manage permission?
          // For strict parity with original: throw error.
          // But admins should be able to create children?
          // Sticking to original logic for now, but enabling admin override via permission would be better.
          // Leaving original strict check + Admin override
          const { role } = await requireActiveMembership(ctx, args.workspaceId); // already got membership
          if (!hasPermission(role, PERMS.DOCUMENTS_MANAGE)) {
            throw new Error("Unauthorized to reference parent document");
          }
        }
        parentId = parent._id;
      }
    }

    const docId = await ctx.db.insert("documents", {
      title: args.title,
      isPublic: args.isPublic,
      createdBy: userId,
      workspaceId: args.workspaceId,
      content: args.content,
      parentId,
      lastModified: Date.now(),
      metadata: args.metadata,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "document.create",
      resourceType: "document",
      resourceId: docId,
      metadata: { title: args.title }
    });

    return docId;
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    const { membership, role } = await requireActiveMembership(ctx, document.workspaceId);
    if (document.createdBy !== membership.userId && !hasPermission(role, PERMS.DOCUMENTS_MANAGE)) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      lastModified: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: document.workspaceId,
      actorUserId: membership.userId,
      action: "document.update_title",
      resourceType: "document",
      resourceId: args.id,
      metadata: { title: args.title }
    });
  },
});

export const togglePublic = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    const { membership, role } = await requireActiveMembership(ctx, document.workspaceId);
    if (document.createdBy !== membership.userId && !hasPermission(role, PERMS.DOCUMENTS_PUBLISH)) {
      // Assuming PUBLISH permission controls public toggle, or MANAGE.
      if (!hasPermission(role, PERMS.DOCUMENTS_MANAGE)) {
        throw new Error("Unauthorized");
      }
    }

    await ctx.db.patch(args.id, {
      isPublic: !document.isPublic,
      lastModified: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: document.workspaceId,
      actorUserId: membership.userId,
      action: "document.toggle_public",
      resourceType: "document",
      resourceId: args.id,
      metadata: { isPublic: !document.isPublic }
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    parentId: v.optional(v.union(v.id("documents"), v.null())),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    const { membership, role } = await requireActiveMembership(ctx, document.workspaceId);
    const userId = membership.userId;

    if (document.createdBy !== userId && !hasPermission(role, PERMS.DOCUMENTS_EDIT)) {
      if (!hasPermission(role, PERMS.DOCUMENTS_MANAGE)) {
        throw new Error("Unauthorized");
      }
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
    if (args.parentId !== undefined) {
      if (args.parentId === null) {
        updates.parentId = undefined;
      } else {
        const parent = await ctx.db.get(args.parentId);
        if (!parent) {
          throw new Error("Parent document not found");
        }
        if (parent.workspaceId !== document.workspaceId) {
          throw new Error("Parent document must belong to the same workspace");
        }
        if (!parent.isPublic && parent.createdBy !== userId) {
          // Basic strict check. If admin logic required, usage of role is needed.
          // But existing logic was strict Owner.
          if (!hasPermission(role, PERMS.DOCUMENTS_MANAGE)) {
            throw new Error("Unauthorized to reference parent document");
          }
        }
        if (String(parent._id) === String(document._id)) {
          throw new Error("Document cannot be its own parent");
        }
        updates.parentId = parent._id;
      }
    }

    await ctx.db.patch(args.id, updates);

    await logAuditEvent(ctx, {
      workspaceId: document.workspaceId,
      actorUserId: userId,
      action: "document.update",
      resourceType: "document",
      resourceId: args.id,
    });
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found");
    }

    const { membership, role } = await requireActiveMembership(ctx, document.workspaceId);
    if (document.createdBy !== membership.userId && !hasPermission(role, PERMS.DOCUMENTS_DELETE)) {
      if (!hasPermission(role, PERMS.DOCUMENTS_MANAGE)) {
        throw new Error("Unauthorized");
      }
    }

    await ctx.db.delete(args.id);

    await logAuditEvent(ctx, {
      workspaceId: document.workspaceId,
      actorUserId: membership.userId,
      action: "document.delete",
      resourceType: "document",
      resourceId: args.id,
    });
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
              image: author.avatarUrl ?? undefined,
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
              image: author.avatarUrl ?? undefined,
            }
            : undefined,
        };
      })
    );

    return withAuthor.sort(sortByLastModifiedDesc);
  },
});





