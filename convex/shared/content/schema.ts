import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Content Schema
 * 
 * Centralized content storage for all workspace assets.
 * Supports: images, videos, audio, documents, links
 * 
 * Every feature can access content through convex/shared/content/
 */

// Content type enum values
export const contentTypes = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("document"),
  v.literal("link")
);

// Content status enum values
export const contentStatus = v.union(
  v.literal("draft"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed"),
  v.literal("archived")
);

// AI Generation source
export const aiGenerationSource = v.union(
  v.literal("nano-banana"),    // Image generation
  v.literal("veo"),            // Video generation
  v.literal("eleven-labs"),    // Voice/Audio generation
  v.literal("openai-dalle"),   // DALL-E
  v.literal("midjourney"),     // Midjourney
  v.literal("stable-diffusion"), // Stable Diffusion
  v.literal("other")
);

// Content table schema
export const contentTable = defineTable({
  // Core fields
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  type: contentTypes,
  status: contentStatus,
  
  // Storage info
  storageId: v.optional(v.id("_storage")), // Convex storage ID for files
  url: v.optional(v.string()),             // External URL for links
  thumbnailStorageId: v.optional(v.id("_storage")), // Thumbnail for videos/images
  
  // File metadata
  mimeType: v.optional(v.string()),
  fileSize: v.optional(v.number()),        // in bytes
  dimensions: v.optional(v.object({
    width: v.number(),
    height: v.number(),
  })),
  duration: v.optional(v.number()),        // for audio/video in seconds
  
  // AI Generation metadata
  aiGenerated: v.optional(v.boolean()),
  aiSource: v.optional(aiGenerationSource),
  aiPrompt: v.optional(v.string()),
  aiSettings: v.optional(v.any()),         // Provider-specific settings
  
  // Organization
  tags: v.optional(v.array(v.string())),
  folder: v.optional(v.string()),          // Virtual folder path
  
  // Metadata
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
  usageCount: v.optional(v.number()),      // How many times this content is used
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_type", ["workspaceId", "type"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_workspace_folder", ["workspaceId", "folder"])
  .index("by_created", ["workspaceId", "createdAt"])
  .searchIndex("search_content", {
    searchField: "name",
    filterFields: ["workspaceId", "type", "status"],
  });

// Content usage tracking (which features use which content)
export const contentUsageTable = defineTable({
  contentId: v.id("content"),
  workspaceId: v.id("workspaces"),
  featureId: v.string(),           // Feature slug that uses this content
  entityId: v.string(),            // Entity ID within the feature
  entityType: v.string(),          // Type of entity (e.g., "post", "product")
  usedAt: v.number(),
})
  .index("by_content", ["contentId"])
  .index("by_feature", ["workspaceId", "featureId"])
  .index("by_entity", ["workspaceId", "featureId", "entityType", "entityId"]);

// AI Generation jobs tracking
export const contentAiJobsTable = defineTable({
  workspaceId: v.id("workspaces"),
  contentId: v.optional(v.id("content")), // Created after generation completes
  source: aiGenerationSource,
  prompt: v.string(),
  settings: v.optional(v.any()),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  result: v.optional(v.any()),             // Provider response
  error: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["workspaceId", "status"])
  .index("by_user", ["workspaceId", "createdBy"]);

// Export all tables for schema integration
export const contentTables = {
  content: contentTable,
  contentUsage: contentUsageTable,
  contentAiJobs: contentAiJobsTable,
};
