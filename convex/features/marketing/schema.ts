/**
 * Marketing Feature Schema
 * Provides marketing campaign functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const marketingTables = {
  // Marketing campaigns
  marketingCampaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("social"),
      v.literal("ads"),
      v.literal("content"),
      v.literal("event"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    content: v.optional(v.object({
      subject: v.optional(v.string()),
      body: v.optional(v.string()),
      template: v.optional(v.string()),
    })),
    audience: v.optional(v.object({
      segments: v.optional(v.array(v.string())),
      filters: v.optional(v.array(v.any())),
      estimatedSize: v.optional(v.number()),
    })),
    schedule: v.optional(v.object({
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      timezone: v.optional(v.string()),
      frequency: v.optional(v.string()),
    })),
    budget: v.optional(v.number()),
    spent: v.optional(v.number()),
    // Metrics
    sent: v.optional(v.number()),
    delivered: v.optional(v.number()),
    opens: v.optional(v.number()),
    clicks: v.optional(v.number()),
    conversions: v.optional(v.number()),
    unsubscribes: v.optional(v.number()),
    bounces: v.optional(v.number()),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // Marketing templates
  marketingTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    content: v.string(),
    variables: v.optional(v.array(v.string())),
    thumbnail: v.optional(v.string()),
    isPublic: v.boolean(),
    usageCount: v.number(),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["type"]),
};

export default marketingTables;
