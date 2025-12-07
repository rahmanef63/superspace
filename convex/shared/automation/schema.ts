import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const triggerValidator = v.union(
  v.literal("on_create"),
  v.literal("on_update"),
  v.literal("on_delete"),
  v.literal("scheduled"),
  v.literal("manual"),
  v.literal("webhook")
);

const actionConfigValidator = v.array(
  v.object({
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
    config: v.optional(v.any()),
    targetEntity: v.optional(v.string()),
    targetConditions: v.optional(
      v.array(
        v.object({
          field: v.string(),
          value: v.any(),
        })
      )
    ),
    recipients: v.optional(v.array(v.string())),
    subject: v.optional(v.string()),
    template: v.optional(v.string()),
    webhookUrl: v.optional(v.string()),
    webhookMethod: v.optional(
      v.union(v.literal("GET"), v.literal("POST"), v.literal("PUT"))
    ),
    webhookHeaders: v.optional(v.record(v.string(), v.any())),
    fieldName: v.optional(v.string()),
    fieldValue: v.optional(v.any()),
    taskTitle: v.optional(v.string()),
    taskDescription: v.optional(v.string()),
    taskAssigneeId: v.optional(v.id("users")),
    taskDueDate: v.optional(v.number()),
    scriptCode: v.optional(v.string()),
    scriptLanguage: v.optional(
      v.union(v.literal("javascript"), v.literal("python"))
    ),
  })
);

export default defineSchema({
  automationRules: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: triggerValidator,
    triggerConditions: v.array(
      v.object({
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
          v.literal("not_in"),
        ),
        value: v.optional(v.any()),
        nestedField: v.optional(v.string()),
      }),
    ),
    actions: actionConfigValidator,
    schedule: v.optional(
      v.object({
        type: v.union(v.literal("once"), v.literal("recurring")),
        executeAt: v.optional(v.number()),
        frequency: v.optional(
          v.union(
            v.literal("minutely"),
            v.literal("hourly"),
            v.literal("daily"),
            v.literal("weekly"),
            v.literal("monthly"),
            v.literal("yearly"),
            v.literal("custom"),
          ),
        ),
        interval: v.optional(v.number()),
        hour: v.optional(v.number()),
        minute: v.optional(v.number()),
        dayOfWeek: v.optional(v.number()),
        dayOfMonth: v.optional(v.number()),
        month: v.optional(v.number()),
        timezone: v.optional(v.string()),
      }),
    ),
    isActive: v.boolean(),
    priority: v.number(),
    maxExecutions: v.optional(v.number()),
    executionCount: v.number(),
    lastExecutedAt: v.optional(v.number()),
    onError: v.union(v.literal("stop"), v.literal("continue"), v.literal("retry"), v.literal("notify")),
    retryCount: v.number(),
    maxRetries: v.number(),
    category: v.string(),
    tags: v.array(v.string()),
    version: v.number(),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_active", ["workspaceId", "isActive"]),

  automationExecutions: defineTable({
    workspaceId: v.id("workspaces"),
    ruleId: v.id("automationRules"),
    ruleVersion: v.number(),
    executionId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    triggerType: v.string(),
    triggerData: v.optional(v.any()),
    retryCount: v.optional(v.number()),
    isRetry: v.optional(v.boolean()),
    entityId: v.optional(v.id("_table")),
    entityType: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    duration: v.optional(v.number()),
    actionsExecuted: v.array(
      v.object({
        actionType: v.string(),
        status: v.union(v.literal("success"), v.literal("failed"), v.literal("skipped")),
        result: v.optional(v.any()),
        error: v.optional(v.string()),
        duration: v.optional(v.number()),
      }),
    ),
    error: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    createdAt: v.number(),
  })
    .index("by_rule", ["ruleId", "startedAt"])
    .index("by_workspace", ["workspaceId", "status"]),

  automationTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("sales"),
      v.literal("inventory"),
      v.literal("crm"),
      v.literal("hr"),
      v.literal("accounting"),
      v.literal("projects"),
      v.literal("general"),
    ),
    scope: v.union(v.literal("public"), v.literal("workspace"), v.literal("private")),
    template: v.object({
      name: v.string(),
      description: v.string(),
      trigger: v.any(),
      triggerConditions: v.array(v.any()),
      actions: v.array(v.any()),
      settings: v.optional(
        v.object({
          isActive: v.boolean(),
          priority: v.number(),
          onError: v.any(),
          maxRetries: v.number(),
        }),
      ),
    }),
    usageCount: v.number(),
    rating: v.number(),
    ratingCount: v.number(),
    tags: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    authorId: v.id("users"),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_category", ["category", "isPublished"]),

  automationStats: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    date: v.number(),
    totalExecutions: v.number(),
    successfulExecutions: v.number(),
    failedExecutions: v.number(),
    avgExecutionTime: v.number(),
    successRate: v.number(),
    topExecutedRules: v.array(
      v.object({
        ruleId: v.id("automationRules"),
        ruleName: v.string(),
        executions: v.number(),
      }),
    ),
    errorTypes: v.array(
      v.object({
        errorType: v.string(),
        count: v.number(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_workspace_period", ["workspaceId", "period"]),
});
