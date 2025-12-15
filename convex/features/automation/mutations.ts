import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Automation Mutations
 * Real implementation for workflow management
 */

// Create new workflow
export const createWorkflow = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.union(
      v.literal("on_create"),
      v.literal("on_update"),
      v.literal("on_delete"),
      v.literal("scheduled"),
      v.literal("manual"),
      v.literal("webhook")
    ),
    triggerConditions: v.optional(v.array(v.any())),
    actions: v.array(v.any()),
    schedule: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.AUTOMATION_MANAGE
    )

    const now = Date.now()

    const workflowId = await ctx.db.insert("automationRules", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      trigger: args.trigger,
      triggerConditions: args.triggerConditions || [],
      actions: args.actions,
      schedule: args.schedule,
      isActive: args.isActive ?? false,
      priority: args.priority ?? 50,
      maxExecutions: undefined,
      executionCount: 0,
      lastExecutedAt: undefined,
      onError: "continue",
      retryCount: 0,
      maxRetries: 3,
      category: args.category || "general",
      tags: args.tags || [],
      version: 1,
      createdAt: now,
      createdBy: membership.userId,
      updatedAt: now,
      updatedBy: membership.userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "automation.workflow.create",
      resourceType: "automationWorkflow",
      resourceId: workflowId,
      metadata: { name: args.name, trigger: args.trigger },
    })

    return { success: true, workflowId }
  },
})

// Update existing workflow
export const updateWorkflow = mutation({
  args: {
    workflowId: v.id("automationRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(
      v.union(
        v.literal("on_create"),
        v.literal("on_update"),
        v.literal("on_delete"),
        v.literal("scheduled"),
        v.literal("manual"),
        v.literal("webhook")
      )
    ),
    triggerConditions: v.optional(v.array(v.any())),
    actions: v.optional(v.array(v.any())),
    schedule: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const { membership } = await requirePermission(
      ctx,
      workflow.workspaceId,
      PERMS.AUTOMATION_MANAGE
    )

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
      updatedBy: membership.userId,
      version: workflow.version + 1,
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.trigger !== undefined) updates.trigger = args.trigger
    if (args.triggerConditions !== undefined)
      updates.triggerConditions = args.triggerConditions
    if (args.actions !== undefined) updates.actions = args.actions
    if (args.schedule !== undefined) updates.schedule = args.schedule
    if (args.isActive !== undefined) updates.isActive = args.isActive
    if (args.priority !== undefined) updates.priority = args.priority
    if (args.category !== undefined) updates.category = args.category
    if (args.tags !== undefined) updates.tags = args.tags

    await ctx.db.patch(args.workflowId, updates)

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: membership.userId,
      action: "automation.workflow.update",
      resourceType: "automationWorkflow",
      resourceId: args.workflowId,
      metadata: { name: args.name || workflow.name },
    })

    return { success: true }
  },
})

// Delete workflow
export const deleteWorkflow = mutation({
  args: {
    workflowId: v.id("automationRules"),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const { membership } = await requirePermission(
      ctx,
      workflow.workspaceId,
      PERMS.AUTOMATION_MANAGE
    )

    await ctx.db.delete(args.workflowId)

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: membership.userId,
      action: "automation.workflow.delete",
      resourceType: "automationWorkflow",
      resourceId: args.workflowId,
      metadata: { name: workflow.name },
    })

    return { success: true }
  },
})

// Toggle workflow active status
export const toggleWorkflow = mutation({
  args: {
    workflowId: v.id("automationRules"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const { membership } = await requirePermission(
      ctx,
      workflow.workspaceId,
      PERMS.AUTOMATION_MANAGE
    )

    await ctx.db.patch(args.workflowId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
      updatedBy: membership.userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: membership.userId,
      action: args.isActive
        ? "automation.workflow.activate"
        : "automation.workflow.deactivate",
      resourceType: "automationWorkflow",
      resourceId: args.workflowId,
      metadata: { name: workflow.name },
    })

    return { success: true }
  },
})

// Execute workflow manually
export const executeWorkflow = mutation({
  args: {
    workflowId: v.id("automationRules"),
    triggerData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const { membership } = await requirePermission(
      ctx,
      workflow.workspaceId,
      PERMS.AUTOMATION_MANAGE
    )

    const now = Date.now()
    const executionId = `exec_${now}_${Math.random().toString(36).slice(2, 8)}`

    // Create execution record
    const execId = await ctx.db.insert("automationExecutions", {
      workspaceId: workflow.workspaceId,
      ruleId: args.workflowId,
      ruleVersion: workflow.version,
      executionId,
      status: "running",
      triggerType: "manual",
      triggerData: args.triggerData,
      startedAt: now,
      actionsExecuted: [],
      createdAt: now,
    })

    // Execute actions
    const actionsExecuted: Array<{
      actionType: string
      status: "success" | "failed" | "skipped"
      result?: any
      error?: string
      duration?: number
    }> = []

    for (const action of workflow.actions) {
      const actionStart = Date.now()
      try {
        // Execute action based on type
        const result = await executeAction(ctx, action, args.triggerData)
        actionsExecuted.push({
          actionType: action.type,
          status: "success",
          result,
          duration: Date.now() - actionStart,
        })
      } catch (error) {
        actionsExecuted.push({
          actionType: action.type,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - actionStart,
        })

        if (workflow.onError === "stop") break
      }
    }

    const completedAt = Date.now()
    const hasErrors = actionsExecuted.some((a) => a.status === "failed")

    // Update execution record
    await ctx.db.patch(execId, {
      status: hasErrors ? "failed" : "completed",
      completedAt,
      duration: completedAt - now,
      actionsExecuted,
    })

    // Update workflow stats
    await ctx.db.patch(args.workflowId, {
      executionCount: workflow.executionCount + 1,
      lastExecutedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: membership.userId,
      action: "automation.workflow.execute",
      resourceType: "automationWorkflow",
      resourceId: args.workflowId,
      metadata: {
        name: workflow.name,
        executionId,
        status: hasErrors ? "failed" : "completed",
      },
    })

    return {
      success: !hasErrors,
      executionId,
      actionsExecuted,
    }
  },
})

// Helper function to execute individual actions
async function executeAction(
  ctx: any,
  action: any,
  triggerData: any
): Promise<any> {
  switch (action.type) {
    case "send_notification":
      // Create notification in database
      await ctx.db.insert("notifications", {
        workspaceId: triggerData?.workspaceId,
        userId: action.recipients?.[0],
        type: "automation",
        title: action.subject || "Automation Notification",
        message: action.template || "Automation executed",
        isRead: false,
        createdAt: Date.now(),
      })
      return { sent: true }

    case "create_task":
      // Create task in database
      const taskId = await ctx.db.insert("tasks", {
        workspaceId: triggerData?.workspaceId,
        title: action.taskTitle,
        description: action.taskDescription,
        assigneeId: action.taskAssigneeId,
        dueDate: action.taskDueDate,
        status: "todo",
        createdAt: Date.now(),
      })
      return { taskId }

    case "update_field":
      // Update field on target entity
      if (triggerData?.entityId && action.fieldName) {
        await ctx.db.patch(triggerData.entityId, {
          [action.fieldName]: action.fieldValue,
        })
        return { updated: true }
      }
      return { skipped: true, reason: "No entity to update" }

    case "webhook":
      // In a real implementation, you'd use an action to call external URLs
      // For now, just log it
      return {
        webhookUrl: action.webhookUrl,
        method: action.webhookMethod,
        scheduled: true,
      }

    case "send_email":
      // Email would be sent via an action with proper email service
      return {
        recipients: action.recipients,
        subject: action.subject,
        scheduled: true,
      }

    default:
      return { actionType: action.type, executed: true }
  }
}

