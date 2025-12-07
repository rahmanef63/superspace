/**
 * Shared Bulk Operations Schema
 * Provides bulk operation functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Bulk operation jobs
  bulkOperations: defineTable({
    workspaceId: v.id("workspaces"),
    entity: v.string(),
    operation: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("archive")
    ),
    totalItems: v.number(),
    processedItems: v.number(),
    successCount: v.number(),
    errorCount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    filters: v.optional(v.array(v.any())),
    data: v.optional(v.array(v.any())), // For create operations
    updates: v.optional(v.array(v.any())), // For update operations
    options: v.optional(v.any()),
    errors: v.array(v.any()),
    startedBy: v.id("users"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace", ["workspaceId", "startedAt"])
    .index("by_status", ["status", "startedAt"])
    .index("by_entity", ["entity", "startedAt"]),

  // Bulk operation templates
  bulkOperationTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    entity: v.string(),
    operation: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("archive")
    ),
    template: v.any(), // JSON template structure
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    usageCount: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_entity", ["entity", "createdAt"]),
});