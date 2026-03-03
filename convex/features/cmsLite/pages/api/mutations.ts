import { v } from "convex/values";
import { mutation } from "../../../../_generated/server";
import { requireAdmin } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

/**
 * Create a new page
 */
export const createPage = mutation({
  args: {
    slug: v.string(),
    locale: v.string(),
    pageType: v.union(
      v.literal("home"),
      v.literal("about"),
      v.literal("products"),
      v.literal("product-detail"),
      v.literal("blog"),
      v.literal("blog-post"),
      v.literal("portfolio"),
      v.literal("hello"),
      v.literal("custom")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);

    // Get user's active workspace
    const adminUser = await ctx.db.get(actor.adminUserId);
    if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
      throw new Error("No workspace found for user");
    }
    const workspaceId = adminUser.workspaceIds[0]; // Use first workspace

    // Check if slug already exists for this workspace
    const existing = await (ctx.db
      .query("cms_lite_pages")
      .withIndex("by_workspace_slug", (q: any) =>
        q.eq("workspaceId", workspaceId)
      )
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first());

    if (existing) {
      throw new Error(`Page with slug "${args.slug}" already exists in this workspace`);
    }

    const now = Date.now();

    const pageId = await ctx.db.insert("cms_lite_pages", {
      slug: args.slug,
      locale: args.locale,
      pageType: args.pageType,
      title: args.title,
      description: args.description,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      metaKeywords: args.metaKeywords,
      isPublished: args.isPublished ?? false,
      displayOrder: args.displayOrder,
      workspaceId,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.clerkUserId,
      updatedBy: actor.clerkUserId,
    });

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      action: "cms_lite_pages.create",
      resourceType: "cms_lite_pages",
      resourceId: pageId,
      metadata: {
        slug: args.slug,
        title: args.title,
        pageType: args.pageType,
      },
    });

    return { pageId };
  },
});

/**
 * Update existing page
 */
export const updatePage = mutation({
  args: {
    pageId: v.id("cms_lite_pages"),
    slug: v.optional(v.string()),
    locale: v.optional(v.string()),
    pageType: v.optional(v.union(
      v.literal("home"),
      v.literal("about"),
      v.literal("products"),
      v.literal("product-detail"),
      v.literal("blog"),
      v.literal("blog-post"),
      v.literal("portfolio"),
      v.literal("hello"),
      v.literal("custom")
    )),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);

    // Get user's active workspace
    const adminUser = await ctx.db.get(actor.adminUserId);
    if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
      throw new Error("No workspace found for user");
    }
    const workspaceId = adminUser.workspaceIds[0];

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    if (page.workspaceId !== workspaceId) {
      throw new Error("Unauthorized access to page");
    }

    // If changing slug, check for conflicts
    if (args.slug && args.slug !== page.slug) {
      const existing = await (ctx.db
        .query("cms_lite_pages")
        .withIndex("by_workspace_slug", (q: any) =>
          q.eq("workspaceId", workspaceId)
        )
        .filter((q) => q.eq(q.field("slug"), args.slug!))
        .first());

      if (existing && existing._id !== args.pageId) {
        throw new Error(`Page with slug "${args.slug}" already exists in this workspace`);
      }
    }

    const updates: any = {
      updatedAt: Date.now(),
      updatedBy: actor.clerkUserId,
    };

    // Add optional fields if provided
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.locale !== undefined) updates.locale = args.locale;
    if (args.pageType !== undefined) updates.pageType = args.pageType;
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.metaTitle !== undefined) updates.metaTitle = args.metaTitle;
    if (args.metaDescription !== undefined) updates.metaDescription = args.metaDescription;
    if (args.metaKeywords !== undefined) updates.metaKeywords = args.metaKeywords;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.displayOrder !== undefined) updates.displayOrder = args.displayOrder;

    await ctx.db.patch(args.pageId, updates);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      action: "cms_lite_pages.update",
      resourceType: "cms_lite_pages",
      resourceId: args.pageId,
      metadata: {
        slug: args.slug,
        title: args.title,
      },
      changes: updates
    });

    return { success: true };
  },
});

/**
 * Delete page
 */
export const deletePage = mutation({
  args: { pageId: v.id("cms_lite_pages") },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);

    // Get user's active workspace
    const adminUser = await ctx.db.get(actor.adminUserId);
    if (!adminUser || !adminUser.workspaceIds || adminUser.workspaceIds.length === 0) {
      throw new Error("No workspace found for user");
    }
    const workspaceId = adminUser.workspaceIds[0];

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    if (page.workspaceId !== workspaceId) {
      throw new Error("Unauthorized access to page");
    }

    await ctx.db.delete(args.pageId);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      action: "cms_lite_pages.delete",
      resourceType: "cms_lite_pages",
      resourceId: args.pageId,
      metadata: {
        slug: page.slug,
        title: page.title,
      },
    });

    return { success: true };
  },
});
