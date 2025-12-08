/**
 * BI (Business Intelligence) Feature Schema
 * Provides BI dashboard and metrics functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const biTables = {
  // BI Dashboards
  biDashboards: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    layout: v.optional(v.array(v.object({
      widgetId: v.string(),
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }))),
    widgets: v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      config: v.record(v.string(), v.any()),
    })),
    isDefault: v.boolean(),
    isPublic: v.boolean(),
    refreshInterval: v.optional(v.number()),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_creator", ["createdBy"]),

  // BI Metrics
  biMetrics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("count"),
      v.literal("sum"),
      v.literal("average"),
      v.literal("percentage"),
      v.literal("custom")
    ),
    dataSource: v.string(),
    query: v.optional(v.record(v.string(), v.any())),
    aggregation: v.optional(v.string()),
    format: v.optional(v.string()),
    unit: v.optional(v.string()),
    goal: v.optional(v.number()),
    thresholds: v.optional(v.object({
      warning: v.optional(v.number()),
      critical: v.optional(v.number()),
    })),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_data_source", ["dataSource"]),
};

export default biTables;
