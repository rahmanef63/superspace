/**
 * Automation Rules Schema
 * Provides workflow automation capabilities across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Automation rule definitions
  automationRules: defineTable({
    docId: v.id("automationRules"),
    workspaceId: v.id("workspaces"),

    // Basic information
    name: v.string(),
    description: v.optional(v.string()),

    // Rule configuration
    trigger: v.union(
      v.literal("on_create"),
      v.literal("on_update"),
      v.literal("on_delete"),
      v.literal("scheduled"),
      v.literal("manual"),
      v.literal("webhook")
    ),

    // Trigger conditions
    triggerConditions: v.array(v.object({
      field: v.string(),
      operator: v.union(
        v.literal("equals"),
        v.literal("not_equals"),
        v.literal("contains"),
        v.literal("starts_with"),
        v.literal("ends_with"),
        v.literal("greater_than"),
        v.literal("less_than"),
        v.literal("is_empty"),
        v.literal("is_not_empty"),
        v.literal("in"),
        v.literal("not_in")
      ),
      value: v.optional(v.any()),
      nestedField: v.optional(v.string()),
    })),

    // Actions to execute
    actions: v.array(v.object({
      type: v.union(
        v.literal("create"),
        v.literal("update"),
        v.literal("delete"),
        v.literal("send_email"),
        v.literal("send_notification"),
        v.literal("webhook"),
        v.literal("run_script"),
        v.literal("update_field"),
        v.literal("create_task"),
        v.literal("assign_user"),
        v.literal("change_status")
      ),

      // Action configuration
      config: v.optional(v.any()),

      // Target configuration
      targetEntity: v.optional(v.string()),
      targetConditions: v.optional(v.array(v.object({
        field: v.string(),
        value: v.any(),
      }))),

      // Email/Webhook specific
      recipients: v.optional(v.array(v.string())),
      subject: v.optional(v.string()),
      template: v.optional(v.string()),
      webhookUrl: v.optional(v.string()),
      webhookMethod: v.optional(v.union(v.literal("GET"), v.literal("POST"), v.literal("PUT"))),
      webhookHeaders: v.optional(v.record(v.string(), v.any())),

      // Field update specific
      fieldName: v.optional(v.string()),
      fieldValue: v.optional(v.any()),

      // Task specific
      taskTitle: v.optional(v.string()),
      taskDescription: v.optional(v.string()),
      taskAssigneeId: v.optional(v.id("users")),
      taskDueDate: v.optional(v.number()),

      // Script specific
      scriptCode: v.optional(v.string()),
      scriptLanguage: v.optional(v.union(v.literal("javascript"), v.literal("python"))),
    })),

    // Scheduling
    schedule: v.optional(v.object({
      type: v.union(
        v.literal("once"),
        v.literal("recurring")
      ),

      // One-time
      executeAt: v.optional(v.number()),

      // Recurring
      frequency: v.optional(v.union(
        v.literal("minutely"),
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly"),
        v.literal("custom")
      )),

      interval: v.optional(v.number()),

      // Time-specific
      hour: v.optional(v.number()),
      minute: v.optional(v.number()),
      dayOfWeek: v.optional(v.number()),
      dayOfMonth: v.optional(v.number()),
      month: v.optional(v.number()),

      // Timezone
      timezone: v.optional(v.string()),
    })),

    // Execution settings
    isActive: v.boolean(),
    priority: v.number(),
    maxExecutions: v.optional(v.number()),
    executionCount: v.number(),
    lastExecutedAt: v.optional(v.number()),

    // Error handling
    onError: v.union(
      v.literal("stop"),
      v.literal("continue"),
      v.literal("retry"),
      v.literal("notify")
    ),
    retryCount: v.number(),
    maxRetries: v.number(),

    // Metadata
    category: v.string(),
    tags: v.array(v.string()),
    version: v.number(),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  }),

  // Automation execution logs
  automationExecutions: defineTable({
    docId: v.id("automationExecutions"),
    workspaceId: v.id("workspaces"),

    // Link to rule
    ruleId: v.id("automationRules"),
    ruleVersion: v.number(),

    // Execution details
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),

    // Trigger information
    triggerType: v.string(),
    triggerData: v.optional(v.any()),
    entityId: v.optional(v.id("_table")),
    entityType: v.optional(v.string()),

    // Execution results
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    duration: v.optional(v.number()),

    // Action results
    actionsExecuted: v.array(v.object({
      actionType: v.string(),
      status: v.union(
        v.literal("success"),
        v.literal("failed"),
        v.literal("skipped")
      ),
      result: v.optional(v.any()),
      error: v.optional(v.string()),
      duration: v.optional(v.number()),
    })),

    // Error information
    errorMessage: v.optional(v.string()),
    errorDetails: v.optional(v.any()),

    // Context
    context: v.optional(v.record(v.string(), v.any())),

    // Execution metadata
    executionId: v.string(),
    parentExecutionId: v.optional(v.string()),

    // Retry information
    retryCount: v.number(),
    isRetry: v.boolean(),

    // System fields
    createdAt: v.number(),
  }),

  // Automation templates
  automationTemplates: defineTable({
    docId: v.id("automationTemplates"),
    workspaceId: v.id("workspaces"),

    // Template information
    name: v.string(),
    description: v.string(),

    // Category and scope
    category: v.union(
      v.literal("sales"),
      v.literal("inventory"),
      v.literal("crm"),
      v.literal("hr"),
      v.literal("accounting"),
      v.literal("projects"),
      v.literal("general")
    ),
    scope: v.union(
      v.literal("public"),
      v.literal("workspace"),
      v.literal("private")
    ),

    // Template data
    template: v.object({
      name: v.string(),
      description: v.string(),
      trigger: v.any(),
      triggerConditions: v.array(v.any()),
      actions: v.array(v.any()),
      settings: v.optional(v.object({
        isActive: v.boolean(),
        priority: v.number(),
        onError: v.any(),
        maxRetries: v.number(),
      })),
    }),

    // Usage tracking
    usageCount: v.number(),
    rating: v.number(),
    ratingCount: v.number(),

    // Metadata
    tags: v.array(v.string()),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),

    // Attribution
    authorId: v.id("users"),
    isPublished: v.boolean(),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Automation statistics
  automationStats: defineTable({
    docId: v.id("automationStats"),
    workspaceId: v.id("workspaces"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    date: v.number(),

    // Execution counts
    totalExecutions: v.number(),
    successfulExecutions: v.number(),
    failedExecutions: v.number(),

    // Performance metrics
    avgExecutionTime: v.number(),
    successRate: v.number(),

    // Top rules
    topExecutedRules: v.array(v.object({
      ruleId: v.id("automationRules"),
      ruleName: v.string(),
      executions: v.number(),
    })),

    // Error breakdown
    errorTypes: v.array(v.object({
      errorType: v.string(),
      count: v.number(),
    })),

    createdAt: v.number(),
  }),
});
