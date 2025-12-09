import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requirePermission, requireActiveMembership, ensureUser } from "../../auth/helpers";
import { PERMS } from "../schema";

/**
 * Content Mutations
 * 
 * Centralized write operations for content across all features.
 * All features should use these mutations to manage workspace content.
 */

// Content type and status for validation
const contentTypeArg = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("document"),
  v.literal("link")
);

const contentStatusArg = v.union(
  v.literal("draft"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed"),
  v.literal("archived")
);

const aiSourceArg = v.union(
  v.literal("nano-banana"),
  v.literal("veo"),
  v.literal("eleven-labs"),
  v.literal("openai-dalle"),
  v.literal("midjourney"),
  v.literal("stable-diffusion"),
  v.literal("other")
);

/**
 * Create new content item
 */
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: contentTypeArg,
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    mimeType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    dimensions: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    duration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.UPLOAD_FILES
    );

    // Get user ID - either from membership or ensure user exists
    const userId = membership?.userDocId ?? await ensureUser(ctx);

    const now = Date.now();
    const contentId = await ctx.db.insert("content", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      status: args.storageId || args.url ? "ready" : "draft",
      storageId: args.storageId,
      url: args.url,
      thumbnailStorageId: args.thumbnailStorageId,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      dimensions: args.dimensions,
      duration: args.duration,
      tags: args.tags,
      folder: args.folder,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    });

    return contentId;
  },
});

/**
 * Bulk create content items (for bulk uploads)
 */
export const bulkCreate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    items: v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      type: contentTypeArg,
      storageId: v.optional(v.id("_storage")),
      url: v.optional(v.string()),
      mimeType: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      folder: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.UPLOAD_FILES
    );

    // Get user ID - either from membership or ensure user exists
    const userId = membership?.userDocId ?? await ensureUser(ctx);

    const now = Date.now();
    const contentIds: string[] = [];

    for (const item of args.items) {
      const contentId = await ctx.db.insert("content", {
        workspaceId: args.workspaceId,
        name: item.name,
        description: item.description,
        type: item.type,
        status: item.storageId || item.url ? "ready" : "draft",
        storageId: item.storageId,
        url: item.url,
        mimeType: item.mimeType,
        fileSize: item.fileSize,
        tags: item.tags,
        folder: item.folder,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
      });
      contentIds.push(contentId);
    }

    return contentIds;
  },
});

/**
 * Update content item
 */
export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(contentStatusArg),
    tags: v.optional(v.array(v.string())),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_FILES);

    const content = await ctx.db.get(args.contentId);
    if (!content || content.workspaceId !== args.workspaceId) {
      throw new Error("Content not found");
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.folder !== undefined) updates.folder = args.folder;

    await ctx.db.patch(args.contentId, updates);

    return args.contentId;
  },
});

/**
 * Delete content item
 */
export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_FILES);

    const content = await ctx.db.get(args.contentId);
    if (!content || content.workspaceId !== args.workspaceId) {
      throw new Error("Content not found");
    }

    // Delete storage files
    if (content.storageId) {
      await ctx.storage.delete(content.storageId);
    }
    if (content.thumbnailStorageId) {
      await ctx.storage.delete(content.thumbnailStorageId);
    }

    // Delete usage records
    const usageRecords = await ctx.db
      .query("contentUsage")
      .withIndex("by_content", (q) => q.eq("contentId", args.contentId))
      .collect();

    for (const usage of usageRecords) {
      await ctx.db.delete(usage._id);
    }

    // Delete content
    await ctx.db.delete(args.contentId);

    return { success: true };
  },
});

/**
 * Bulk delete content items
 */
export const bulkRemove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contentIds: v.array(v.id("content")),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_FILES);

    let deleted = 0;
    for (const contentId of args.contentIds) {
      const content = await ctx.db.get(contentId);
      if (content && content.workspaceId === args.workspaceId) {
        // Delete storage files
        if (content.storageId) {
          await ctx.storage.delete(content.storageId);
        }
        if (content.thumbnailStorageId) {
          await ctx.storage.delete(content.thumbnailStorageId);
        }

        // Delete usage records
        const usageRecords = await ctx.db
          .query("contentUsage")
          .withIndex("by_content", (q) => q.eq("contentId", contentId))
          .collect();

        for (const usage of usageRecords) {
          await ctx.db.delete(usage._id);
        }

        await ctx.db.delete(contentId);
        deleted++;
      }
    }

    return { deleted };
  },
});

/**
 * Generate upload URL for file storage
 */
export const generateUploadUrl = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.UPLOAD_FILES);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Track content usage by a feature
 */
export const trackUsage = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
    featureId: v.string(),
    entityId: v.string(),
    entityType: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const content = await ctx.db.get(args.contentId);
    if (!content || content.workspaceId !== args.workspaceId) {
      throw new Error("Content not found");
    }

    // Check if usage already exists
    const existing = await ctx.db
      .query("contentUsage")
      .withIndex("by_entity", (q) =>
        q
          .eq("workspaceId", args.workspaceId)
          .eq("featureId", args.featureId)
          .eq("entityType", args.entityType)
          .eq("entityId", args.entityId)
      )
      .first();

    if (existing) {
      // Update existing usage
      await ctx.db.patch(existing._id, {
        contentId: args.contentId,
        usedAt: Date.now(),
      });
    } else {
      // Create new usage record
      await ctx.db.insert("contentUsage", {
        contentId: args.contentId,
        workspaceId: args.workspaceId,
        featureId: args.featureId,
        entityId: args.entityId,
        entityType: args.entityType,
        usedAt: Date.now(),
      });
    }

    // Increment usage count
    await ctx.db.patch(args.contentId, {
      usageCount: (content.usageCount ?? 0) + 1,
    });

    return { success: true };
  },
});

/**
 * Create AI generation job
 */
export const createAiJob = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    source: aiSourceArg,
    prompt: v.string(),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.UPLOAD_FILES
    );

    // Get user ID - either from membership or ensure user exists
    const userId = membership?.userDocId ?? await ensureUser(ctx);

    const jobId = await ctx.db.insert("contentAiJobs", {
      workspaceId: args.workspaceId,
      source: args.source,
      prompt: args.prompt,
      settings: args.settings,
      status: "pending",
      createdBy: userId,
      createdAt: Date.now(),
    });

    return jobId;
  },
});

/**
 * Update AI generation job status
 */
export const updateAiJob = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    jobId: v.id("contentAiJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    contentId: v.optional(v.id("content")),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_FILES);

    const job = await ctx.db.get(args.jobId);
    if (!job || job.workspaceId !== args.workspaceId) {
      throw new Error("Job not found");
    }

    const updates: Record<string, any> = {
      status: args.status,
    };

    if (args.result !== undefined) updates.result = args.result;
    if (args.error !== undefined) updates.error = args.error;
    if (args.contentId !== undefined) updates.contentId = args.contentId;
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updates);

    return args.jobId;
  },
});
