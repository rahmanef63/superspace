/**
 * Comments Schema
 * Provides commenting functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Comments
  comments: defineTable({
    workspaceId: v.id("workspaces"),

    // Reference to the commented entity
    entityType: v.string(), // e.g., "invoices", "tasks", "projects"
    entityId: v.id("_table"),

    // Thread management
    threadId: v.optional(v.id("comments")), // For nested comments
    replyToId: v.optional(v.id("comments")), // Direct reply to

    // Comment content
    content: v.string(),
    format: v.optional(v.union(
      v.literal("plain"),
      v.literal("markdown"),
      v.literal("html")
    )),

    // Metadata
    mentions: v.array(v.id("users")),
    tags: v.array(v.string()),
    attachments: v.array(v.id("_storage")),

    // Status
    isEdited: v.boolean(),
    isDeleted: v.boolean(),
    isResolved: v.boolean(),
    isPinned: v.boolean(),

    // Moderation
    isReported: v.boolean(),
    reportReason: v.optional(v.string()),
    moderatedById: v.optional(v.id("users")),
    moderatedAt: v.optional(v.number()),

    // Reactions
    reactions: v.array(v.object({
      userId: v.id("users"),
      emoji: v.string(),
      createdAt: v.number(),
    })),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  }),

  // Comment subscriptions
  commentSubscriptions: defineTable({
    workspaceId: v.id("workspaces"),

    // Subscription details
    userId: v.id("users"),
    entityType: v.string(),
    entityId: v.id("_table"),

    // Notification preferences
    isActive: v.boolean(),
    notifyOnReply: v.boolean(),
    notifyOnMention: v.boolean(),
    notifyOnAll: v.boolean(),

    // Subscription metadata
    subscribedAt: v.number(),
    lastNotifiedAt: v.optional(v.number()),
  }),

  // Comment threads summary
  commentThreads: defineTable({
    workspaceId: v.id("workspaces"),

    // Thread reference
    entityType: v.string(),
    entityId: v.id("_table"),

    // Thread statistics
    commentCount: v.number(),
    participantCount: v.number(),
    lastCommentAt: v.number(),
    lastCommentBy: v.id("users"),

    // Thread status
    isResolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),

    // Thread priority
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),

    // Assignees
    assignees: v.array(v.id("users")),

    // Metadata
    tags: v.array(v.string()),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Comment analytics
  commentAnalytics: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    date: v.number(),

    // Comment metrics
    totalComments: v.number(),
    uniqueCommenters: v.number(),
    averageCommentsPerThread: v.number(),

    // Engagement metrics
    totalReactions: v.number(),
    totalReplies: v.number(),
    averageResponseTime: v.number(), // in minutes

    // Resolution metrics
    resolvedThreads: v.number(),
    averageResolutionTime: v.number(), // in hours

    // Top entities
    mostCommentedEntities: v.array(v.object({
      entityType: v.string(),
      entityId: v.id("_table"),
      count: v.number(),
    })),

    // Top commenters
    topCommenters: v.array(v.object({
      userId: v.id("users"),
      count: v.number(),
    })),

    createdAt: v.number(),
  }),
});
