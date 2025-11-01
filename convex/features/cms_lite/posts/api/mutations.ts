import { mutation } from "../../_generated";
import { v } from "convex/values";
import type { Doc, Id, MutationCtx } from "../../_generated";
import { requireAdmin, requireEditor } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";
import { postObject } from "./queries";

type PostSnapshot = Doc<"posts">;
type PostInsert = Omit<PostSnapshot, "_id" | "_creationTime">;

function definedFields<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      (output as Record<string, unknown>)[key] = value;
    }
  }
  return output;
}

function snapshotPost(post: PostSnapshot, overrides: Record<string, unknown> = {}) {
  return {
    postId: post._id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    excerpt: post.excerpt ?? null,
    body: post.body,
    coverImage: post.coverImage ?? null,
    status: post.status,
    publishedAt: post.publishedAt ?? null,
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    metaKeywords: post.metaKeywords ?? null,
    createdBy: post.updatedBy ?? post.createdBy ?? null,
    ...overrides,
  };
}

function mapPostToResponse(post: PostSnapshot) {
  return {
    id: post._id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    excerpt: post.excerpt ?? null,
    body: post.body,
    coverImage: post.coverImage ?? null,
    status: post.status,
    publishedAt: post.publishedAt ?? null,
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    metaKeywords: post.metaKeywords ?? null,
    scheduledPublishAt: post.scheduledPublishAt ?? null,
    autoPublished: post.autoPublished ?? false,
  };
}

const basePostArgs = {
  slug: v.string(),
  locale: v.string(),
  title: v.string(),
  excerpt: v.optional(v.union(v.string(), v.null())),
  body: v.string(),
  coverImage: v.optional(v.union(v.string(), v.null())),
  publishedAt: v.optional(v.union(v.number(), v.null())),
  status: v.string(),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  revisionNote: v.optional(v.union(v.string(), v.null())),
  scheduledPublishAt: v.optional(v.union(v.number(), v.null())),
  autoPublished: v.optional(v.boolean()),
};

type PostWriteArgs = {
  slug: string;
  locale: string;
  title: string;
  excerpt?: string | null;
  body: string;
  coverImage?: string | null;
  publishedAt?: number | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  revisionNote?: string | null;
  scheduledPublishAt?: number | null;
  autoPublished?: boolean;
};

export const createPost = mutation({
  args: basePostArgs,
  returns: postObject,
  handler: async (ctx: MutationCtx, args: PostWriteArgs) => {
    const actor = await requireEditor(ctx);

    const conflict = await ctx.db
      .query("posts")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", args.slug).eq("locale", args.locale))
      .first();

    if (conflict) {
      throw new Error("Post with this slug and locale already exists");
    }

    const postPayload: PostInsert = {
      slug: args.slug,
      locale: args.locale,
      title: args.title,
      excerpt: args.excerpt ?? null,
      body: args.body,
      coverImage: args.coverImage ?? null,
      publishedAt: args.publishedAt ?? null,
      status: args.status,
      metaTitle: args.metaTitle ?? null,
      metaDescription: args.metaDescription ?? null,
      metaKeywords: args.metaKeywords ?? null,
      scheduledPublishAt: args.scheduledPublishAt ?? null,
      autoPublished: args.autoPublished ?? false,
      createdBy: actor.clerkUserId ?? null,
      updatedBy: actor.clerkUserId ?? null,
    };

    const postId = await ctx.db.insert("posts", postPayload);

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Failed to load post after creation");
    }

    await ctx.db.insert(
      "postRevisions",
      snapshotPost(post, {
        createdBy: actor.clerkUserId,
        revisionNote: args.revisionNote ?? "Initial version",
      }),
    );

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "post",
      entityId: postId,
      action: "create",
      changes: {
        slug: args.slug,
        locale: args.locale,
        status: args.status,
      },
    });

    return mapPostToResponse(post);
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    ...basePostArgs,
  },
  returns: postObject,
  handler: async (
    ctx: MutationCtx,
    args: PostWriteArgs & {
      id: Id<"posts">;
    },
  ) => {
    const actor = await requireEditor(ctx);

    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    const conflict = await ctx.db
      .query("posts")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", args.slug).eq("locale", args.locale))
      .first();

    if (conflict && conflict._id !== args.id) {
      throw new Error("Another post with this slug and locale already exists");
    }

    await ctx.db.insert(
      "postRevisions",
      snapshotPost(post, {
        createdBy: actor.clerkUserId,
        revisionNote: args.revisionNote ?? "Update",
      }),
    );

    const patch = definedFields<Partial<PostInsert>>({
      slug: args.slug,
      locale: args.locale,
      title: args.title,
      excerpt: args.excerpt ?? null,
      body: args.body,
      coverImage: args.coverImage ?? null,
      publishedAt: args.publishedAt ?? null,
      status: args.status,
      metaTitle: args.metaTitle ?? null,
      metaDescription: args.metaDescription ?? null,
      metaKeywords: args.metaKeywords ?? null,
      scheduledPublishAt: args.scheduledPublishAt ?? null,
      autoPublished: args.autoPublished,
      updatedBy: actor.clerkUserId ?? null,
    }) as Partial<PostInsert>;

    await ctx.db.patch(args.id, patch as any);

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new Error("Failed to load post after update");
    }

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "post",
      entityId: args.id,
      action: "update",
      changes: {
        title: updated.title,
        status: updated.status,
        revisionNote: args.revisionNote ?? "Update",
      },
    });

    return mapPostToResponse(updated);
  },
});

export const deletePost = mutation({
  args: {
    id: v.id("posts"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, { id }: { id: Id<"posts"> }) => {
    const actor = await requireEditor(ctx);

    const post = await ctx.db.get(id);
    if (!post) {
      throw new Error("Post not found");
    }

    const revisions = await ctx.db
      .query("postRevisions")
      .withIndex("by_post", (q: any) => q.eq("postId", id))
      .collect();

    await Promise.all(revisions.map((revision: any) => ctx.db.delete(revision._id)));
    await ctx.db.delete(id);

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "post",
      entityId: id,
      action: "delete",
    });

    return { success: true };
  },
});

export const restorePostRevision = mutation({
  args: {
    postId: v.id("posts"),
    revisionId: v.id("postRevisions"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (
    ctx: MutationCtx,
    {
      postId,
      revisionId,
    }: {
      postId: Id<"posts">;
      revisionId: Id<"postRevisions">;
    },
  ) => {
    const actor = await requireAdmin(ctx);

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.postId !== postId) {
      throw new Error("Revision not found");
    }

    await ctx.db.insert(
      "postRevisions",
      snapshotPost(post, {
        createdBy: actor.clerkUserId,
        revisionNote: "Auto-saved before restore",
      }),
    );

    const restoredPatch = definedFields<Partial<PostInsert>>({
      slug: revision.slug,
      locale: revision.locale,
      title: revision.title,
      excerpt: revision.excerpt ?? null,
      body: revision.body,
      coverImage: revision.coverImage ?? null,
      status: revision.status,
      publishedAt: revision.publishedAt ?? null,
      metaTitle: revision.metaTitle ?? null,
      metaDescription: revision.metaDescription ?? null,
      metaKeywords: revision.metaKeywords ?? null,
      updatedBy: actor.clerkUserId ?? null,
    }) as Partial<PostInsert>;

    await ctx.db.patch(postId, restoredPatch as any);

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "post",
      entityId: postId,
      action: "restore_revision",
      changes: {
        revisionId,
      },
    });

    return { success: true };
  },
});

export const bulkUpdatePosts = mutation({
  args: {
    ids: v.array(v.id("posts")),
    action: v.union(v.literal("publish"), v.literal("unpublish"), v.literal("delete")),
  },
  returns: v.object({
    success: v.boolean(),
    affected: v.number(),
  }),
  handler: async (
    ctx: MutationCtx,
    {
      ids,
      action,
    }: {
      ids: Id<"posts">[];
      action: "publish" | "unpublish" | "delete";
    },
  ) => {
    const actor = await requireAdmin(ctx);

    if (ids.length === 0) {
      return { success: true, affected: 0 };
    }

    let affected = 0;

    for (const id of ids) {
      const post = await ctx.db.get(id);
      if (!post) {
        continue;
      }

      switch (action) {
        case "publish": {
          if (post.status !== "published") {
            const publishPatch = definedFields<Partial<PostInsert>>({
              status: "published",
              publishedAt: Date.now(),
              autoPublished: post.autoPublished ?? false,
              updatedBy: actor.clerkUserId ?? null,
            }) as Partial<PostInsert>;
            await ctx.db.patch(id, publishPatch as any);
            affected += 1;
            await recordAuditEvent(ctx, {
              actorId: actor.clerkUserId,
              entity: "post",
              entityId: id,
              action: "publish",
            });
          }
          break;
        }
        case "unpublish": {
          if (post.status !== "draft") {
            const unpublishPatch = definedFields<Partial<PostInsert>>({
              status: "draft",
              publishedAt: null,
              updatedBy: actor.clerkUserId ?? null,
            }) as Partial<PostInsert>;
            await ctx.db.patch(id, unpublishPatch as any);
            affected += 1;
            await recordAuditEvent(ctx, {
              actorId: actor.clerkUserId,
              entity: "post",
              entityId: id,
              action: "unpublish",
            });
          }
          break;
        }
        case "delete": {
          const revisions = await ctx.db
            .query("postRevisions")
            .withIndex("by_post", (q: any) => q.eq("postId", id))
            .collect();
          await Promise.all(revisions.map((revision: any) => ctx.db.delete(revision._id)));
          await ctx.db.delete(id);
          affected += 1;
          await recordAuditEvent(ctx, {
            actorId: actor.clerkUserId,
            entity: "post",
            entityId: id,
            action: "delete",
          });
          break;
        }
      }
    }

    return { success: true, affected };
  },
});


