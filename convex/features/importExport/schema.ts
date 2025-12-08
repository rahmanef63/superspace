/**
 * Import/Export Feature Schema
 * Provides import/export history tracking
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const importExportTables = {
  // Import/Export history
  importExportHistory: defineTable({
    type: v.union(v.literal("import"), v.literal("export")),
    entityType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    fileName: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    format: v.string(),
    recordCount: v.optional(v.number()),
    successCount: v.optional(v.number()),
    errorCount: v.optional(v.number()),
    errors: v.optional(v.array(v.object({
      row: v.optional(v.number()),
      field: v.optional(v.string()),
      message: v.string(),
    }))),
    options: v.optional(v.record(v.string(), v.any())),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),
};

export default importExportTables;
