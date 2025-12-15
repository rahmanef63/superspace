import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Automation Queries
 * Real implementation for workflow management
 */

// List all automation rules/workflows
export const listWorkflows = query({
  args: {
    workspaceId: v.id("workspaces"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const query = args.activeOnly
      ? ctx.db
          .query("automationRules")
          .withIndex("by_active", (q) =>
            q.eq("workspaceId", args.workspaceId).eq("isActive", true)
          )
      : ctx.db
          .query("automationRules")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))

    const workflows = await query.collect()

    return workflows.map((w) => ({
      _id: w._id,
      name: w.name,
      description: w.description,
      trigger: w.trigger,
      isActive: w.isActive,
      priority: w.priority,
      executionCount: w.executionCount,
      lastExecutedAt: w.lastExecutedAt,
      category: w.category,
      tags: w.tags,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }))
  },
})

// Get single workflow with full details
export const getWorkflow = query({
  args: {
    workflowId: v.id("automationRules"),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) return null

    await requireActiveMembership(ctx, workflow.workspaceId)

    // Get recent executions
    const executions = await ctx.db
      .query("automationExecutions")
      .withIndex("by_rule", (q) => q.eq("ruleId", args.workflowId))
      .order("desc")
      .take(10)

    return {
      ...workflow,
      recentExecutions: executions,
    }
  },
})

// Get workflow executions history
export const getExecutions = query({
  args: {
    workspaceId: v.id("workspaces"),
    workflowId: v.optional(v.id("automationRules")),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let executions = await ctx.db
      .query("automationExecutions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit || 50)

    // Apply filters
    if (args.workflowId) {
      executions = executions.filter((e) => e.ruleId === args.workflowId)
    }
    if (args.status) {
      executions = executions.filter((e) => e.status === args.status)
    }

    // Enrich with workflow names
    const workflowIds = [...new Set(executions.map((e) => e.ruleId))]
    const workflows = await Promise.all(workflowIds.map((id) => ctx.db.get(id)))
    const workflowMap = new Map(
      workflows.filter(Boolean).map((w) => [w!._id, w!.name])
    )

    return executions.map((e) => ({
      _id: e._id,
      workflowId: e.ruleId,
      workflowName: workflowMap.get(e.ruleId) || "Unknown",
      status: e.status,
      triggerType: e.triggerType,
      startedAt: e.startedAt,
      completedAt: e.completedAt,
      duration: e.duration,
      actionsExecuted: e.actionsExecuted,
      error: e.error,
    }))
  },
})

// Get automation statistics
export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get all workflows
    const workflows = await ctx.db
      .query("automationRules")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    // Get recent executions
    const executions = await ctx.db
      .query("automationExecutions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(100)

    const activeWorkflows = workflows.filter((w) => w.isActive).length
    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(
      (e) => e.status === "completed"
    ).length
    const failedExecutions = executions.filter((e) => e.status === "failed").length

    const avgDuration =
      executions.length > 0
        ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) /
          executions.length
        : 0

    return {
      totalWorkflows: workflows.length,
      activeWorkflows,
      inactiveWorkflows: workflows.length - activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate:
        totalExecutions > 0
          ? Math.round((successfulExecutions / totalExecutions) * 100)
          : 0,
      avgExecutionTime: Math.round(avgDuration),
      recentActivity: executions.slice(0, 5).map((e) => ({
        workflowId: e.ruleId,
        status: e.status,
        startedAt: e.startedAt,
      })),
    }
  },
})

// Get automation templates
export const getTemplates = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(
      v.union(
        v.literal("sales"),
        v.literal("inventory"),
        v.literal("crm"),
        v.literal("hr"),
        v.literal("accounting"),
        v.literal("projects"),
        v.literal("general")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let templates = await ctx.db
      .query("automationTemplates")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    // Also get public templates
    const publicTemplates = await ctx.db
      .query("automationTemplates")
      .filter((q) => q.eq(q.field("scope"), "public"))
      .collect()

    templates = [...templates, ...publicTemplates]

    if (args.category) {
      templates = templates.filter((t) => t.category === args.category)
    }

    return templates.map((t) => ({
      _id: t._id,
      name: t.name,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      usageCount: t.usageCount,
      rating: t.rating,
      tags: t.tags,
      template: t.template,
    }))
  },
})
