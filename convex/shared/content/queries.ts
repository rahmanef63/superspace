import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireActiveMembership } from "../../auth/helpers";

/**
 * Content Queries
 * 
 * Centralized read operations for content across all features.
 * All features should use these queries to access workspace content.
 */

// Content type and status for validation
const contentTypeArg = v.optional(v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("document"),
  v.literal("link")
));

const contentStatusArg = v.optional(v.union(
  v.literal("draft"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed"),
  v.literal("archived")
));

const sortByArg = v.optional(v.union(
  v.literal("name"),
  v.literal("createdAt"),
  v.literal("updatedAt"),
  v.literal("fileSize"),
  v.literal("usageCount")
));

const sortOrderArg = v.optional(v.union(
  v.literal("asc"),
  v.literal("desc")
));

/**
 * List all content for a workspace with filtering and pagination
 */
export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: contentTypeArg,
    status: contentStatusArg,
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sortBy: sortByArg,
    sortOrder: sortOrderArg,
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check workspace membership
    await requireActiveMembership(ctx, args.workspaceId);

    const limit = args.limit ?? 50;
    
    // Build query based on filters
    let contentQuery = ctx.db
      .query("content")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    // Get all matching content
    let content = await contentQuery.collect();

    // Apply filters
    if (args.type) {
      content = content.filter(c => c.type === args.type);
    }
    if (args.status) {
      content = content.filter(c => c.status === args.status);
    }
    if (args.folder) {
      content = content.filter(c => c.folder === args.folder);
    }
    if (args.tags && args.tags.length > 0) {
      content = content.filter(c => 
        c.tags && args.tags!.some(tag => c.tags!.includes(tag))
      );
    }

    // Sort
    const sortBy = args.sortBy ?? "createdAt";
    const sortOrder = args.sortOrder ?? "desc";
    
    content.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a];
      let bVal: any = b[sortBy as keyof typeof b];
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    // Paginate
    const startIndex = args.cursor ? parseInt(args.cursor) : 0;
    const paginatedContent = content.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < content.length;

    // Get storage URLs for files
    const contentWithUrls = await Promise.all(
      paginatedContent.map(async (item) => {
        let fileUrl: string | null = null;
        let thumbnailUrl: string | null = null;

        if (item.storageId) {
          fileUrl = await ctx.storage.getUrl(item.storageId);
        }
        if (item.thumbnailStorageId) {
          thumbnailUrl = await ctx.storage.getUrl(item.thumbnailStorageId);
        }

        return {
          ...item,
          fileUrl,
          thumbnailUrl,
        };
      })
    );

    return {
      items: contentWithUrls,
      nextCursor: hasMore ? String(startIndex + limit) : null,
      totalCount: content.length,
    };
  },
});

/**
 * Get a single content item by ID
 */
export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const content = await ctx.db.get(args.contentId);
    if (!content || content.workspaceId !== args.workspaceId) {
      return null;
    }

    // Get storage URLs
    let fileUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (content.storageId) {
      fileUrl = await ctx.storage.getUrl(content.storageId);
    }
    if (content.thumbnailStorageId) {
      thumbnailUrl = await ctx.storage.getUrl(content.thumbnailStorageId);
    }

    return {
      ...content,
      fileUrl,
      thumbnailUrl,
    };
  },
});

/**
 * Search content by name
 */
export const search = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    type: contentTypeArg,
    status: contentStatusArg,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const limit = args.limit ?? 20;

    // Use search index
    let results = await ctx.db
      .query("content")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("name", args.query);
        search = search.eq("workspaceId", args.workspaceId);
        if (args.type) {
          search = search.eq("type", args.type);
        }
        if (args.status) {
          search = search.eq("status", args.status);
        }
        return search;
      })
      .take(limit);

    // Get storage URLs
    const contentWithUrls = await Promise.all(
      results.map(async (item) => {
        let fileUrl: string | null = null;
        let thumbnailUrl: string | null = null;

        if (item.storageId) {
          fileUrl = await ctx.storage.getUrl(item.storageId);
        }
        if (item.thumbnailStorageId) {
          thumbnailUrl = await ctx.storage.getUrl(item.thumbnailStorageId);
        }

        return {
          ...item,
          fileUrl,
          thumbnailUrl,
        };
      })
    );

    return contentWithUrls;
  },
});

/**
 * Get content statistics for a workspace
 */
export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const allContent = await ctx.db
      .query("content")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const stats = {
      total: allContent.length,
      byType: {
        image: 0,
        video: 0,
        audio: 0,
        document: 0,
        link: 0,
      },
      byStatus: {
        draft: 0,
        processing: 0,
        ready: 0,
        failed: 0,
        archived: 0,
      },
      totalSize: 0,
      aiGenerated: 0,
    };

    for (const content of allContent) {
      stats.byType[content.type]++;
      stats.byStatus[content.status]++;
      if (content.fileSize) {
        stats.totalSize += content.fileSize;
      }
      if (content.aiGenerated) {
        stats.aiGenerated++;
      }
    }

    return stats;
  },
});

/**
 * Get content usage across features
 */
export const getUsage = query({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const usage = await ctx.db
      .query("contentUsage")
      .withIndex("by_content", (q) => q.eq("contentId", args.contentId))
      .collect();

    return usage;
  },
});

/**
 * Get all unique tags in workspace
 */
export const getTags = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const allContent = await ctx.db
      .query("content")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const tagsSet = new Set<string>();
    for (const content of allContent) {
      if (content.tags) {
        content.tags.forEach(tag => tagsSet.add(tag));
      }
    }

    return Array.from(tagsSet).sort();
  },
});

/**
 * Get all folders in workspace
 */
export const getFolders = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const allContent = await ctx.db
      .query("content")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const foldersSet = new Set<string>();
    for (const content of allContent) {
      if (content.folder) {
        foldersSet.add(content.folder);
      }
    }

    return Array.from(foldersSet).sort();
  },
});

/**
 * Get AI generation jobs
 */
export const getAiJobs = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    let query = ctx.db
      .query("contentAiJobs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc");

    const jobs = await query.take(args.limit ?? 20);

    if (args.status) {
      return jobs.filter(j => j.status === args.status);
    }

    return jobs;
  },
});
