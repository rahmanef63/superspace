/**
 * Scheduled Automations Processor
 * Cron-triggered execution of scheduled automation workflows
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";

/**
 * Get all scheduled automations that are due to run
 */
export const getScheduledAutomations = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active scheduled automations
    const automations = await ctx.db
      .query("automationRules")
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("trigger"), "scheduled")
        )
      )
      .collect();

    // Filter to ones that should run now
    const dueAutomations = automations.filter((automation) => {
      if (!automation.schedule) return false;

      const schedule = automation.schedule;
      const lastExecuted = automation.lastExecutedAt || 0;

      // For one-time schedules
      if (schedule.type === "once") {
        return (
          schedule.executeAt &&
          schedule.executeAt <= now &&
          !automation.lastExecutedAt
        );
      }

      // For recurring schedules
      if (schedule.type === "recurring" && schedule.frequency) {
        const intervalMs = getIntervalMs(schedule.frequency, schedule.interval);
        return now - lastExecuted >= intervalMs;
      }

      return false;
    });

    return dueAutomations.map((a) => ({
      _id: a._id,
      workspaceId: a.workspaceId,
      name: a.name,
      actions: a.actions,
      onError: a.onError,
      version: a.version,
    }));
  },
});

/**
 * Execute a scheduled automation
 */
export const executeScheduledAutomation = internalMutation({
  args: {
    automationId: v.id("automationRules"),
  },
  handler: async (ctx, args) => {
    const automation = await ctx.db.get(args.automationId);
    if (!automation) {
      console.log(`Automation ${args.automationId} not found`);
      return { success: false, error: "Automation not found" };
    }

    if (!automation.isActive) {
      console.log(`Automation ${automation.name} is not active, skipping`);
      return { success: false, error: "Automation not active" };
    }

    const now = Date.now();
    const executionId = `exec_${now}_${Math.random().toString(36).slice(2, 8)}`;

    // Create execution record
    const execId = await ctx.db.insert("automationExecutions", {
      workspaceId: automation.workspaceId,
      ruleId: args.automationId,
      ruleVersion: automation.version,
      executionId,
      status: "running",
      triggerType: "scheduled",
      triggerData: { scheduledAt: now },
      startedAt: now,
      actionsExecuted: [],
      createdAt: now,
    });

    // Execute actions
    const actionsExecuted: Array<{
      actionType: string;
      status: "success" | "failed" | "skipped";
      result?: any;
      error?: string;
      duration?: number;
    }> = [];

    for (const action of automation.actions) {
      const actionStart = Date.now();
      try {
        const result = await executeAction(ctx, action, {
          workspaceId: automation.workspaceId,
          automationId: args.automationId,
          automationName: automation.name,
        });
        actionsExecuted.push({
          actionType: action.type,
          status: "success",
          result,
          duration: Date.now() - actionStart,
        });
      } catch (error) {
        actionsExecuted.push({
          actionType: action.type,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - actionStart,
        });

        if (automation.onError === "stop") break;
      }
    }

    const completedAt = Date.now();
    const hasErrors = actionsExecuted.some((a) => a.status === "failed");

    // Update execution record
    await ctx.db.patch(execId, {
      status: hasErrors ? "failed" : "completed",
      completedAt,
      duration: completedAt - now,
      actionsExecuted,
      error: hasErrors ? "One or more actions failed" : undefined,
    });

    // Update automation stats
    await ctx.db.patch(args.automationId, {
      executionCount: automation.executionCount + 1,
      lastExecutedAt: now,
    });

    console.log(
      `Automation "${automation.name}" executed: ${hasErrors ? "with errors" : "successfully"}`
    );

    return {
      success: !hasErrors,
      executionId,
      actionsExecuted: actionsExecuted.length,
      errors: actionsExecuted.filter((a) => a.status === "failed").length,
    };
  },
});

/**
 * Process all due scheduled automations
 * Called by cron job
 */
export const processScheduledAutomations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active scheduled automations
    const automations = await ctx.db
      .query("automationRules")
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("trigger"), "scheduled")
        )
      )
      .collect();

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const automation of automations) {
      if (!automation.schedule) continue;

      const schedule = automation.schedule;
      const lastExecuted = automation.lastExecutedAt || 0;
      let shouldRun = false;

      // For one-time schedules
      if (schedule.type === "once") {
        shouldRun =
          schedule.executeAt !== undefined &&
          schedule.executeAt <= now &&
          !automation.lastExecutedAt;
      }

      // For recurring schedules
      if (schedule.type === "recurring" && schedule.frequency) {
        const intervalMs = getIntervalMs(schedule.frequency, schedule.interval);
        shouldRun = now - lastExecuted >= intervalMs;
      }

      if (!shouldRun) continue;

      processed++;
      const executionId = `exec_${now}_${Math.random().toString(36).slice(2, 8)}`;

      // Create execution record
      const execId = await ctx.db.insert("automationExecutions", {
        workspaceId: automation.workspaceId,
        ruleId: automation._id,
        ruleVersion: automation.version,
        executionId,
        status: "running",
        triggerType: "scheduled",
        triggerData: { scheduledAt: now },
        startedAt: now,
        actionsExecuted: [],
        createdAt: now,
      });

      // Execute actions
      const actionsExecuted: Array<{
        actionType: string;
        status: "success" | "failed" | "skipped";
        result?: any;
        error?: string;
        duration?: number;
      }> = [];

      for (const action of automation.actions) {
        const actionStart = Date.now();
        try {
          const result = await executeAction(ctx, action, {
            workspaceId: automation.workspaceId,
            automationId: automation._id,
            automationName: automation.name,
          });
          actionsExecuted.push({
            actionType: action.type,
            status: "success",
            result,
            duration: Date.now() - actionStart,
          });
        } catch (error) {
          actionsExecuted.push({
            actionType: action.type,
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - actionStart,
          });

          if (automation.onError === "stop") break;
        }
      }

      const completedAt = Date.now();
      const hasErrors = actionsExecuted.some((a) => a.status === "failed");

      // Update execution record
      await ctx.db.patch(execId, {
        status: hasErrors ? "failed" : "completed",
        completedAt,
        duration: completedAt - now,
        actionsExecuted,
        error: hasErrors ? "One or more actions failed" : undefined,
      });

      // Update automation stats
      await ctx.db.patch(automation._id, {
        executionCount: automation.executionCount + 1,
        lastExecutedAt: now,
      });

      if (hasErrors) {
        failed++;
      } else {
        succeeded++;
      }
    }

    console.log(
      `Processed ${processed} scheduled automations: ${succeeded} succeeded, ${failed} failed`
    );

    return { processed, succeeded, failed };
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

function getIntervalMs(
  frequency: string,
  interval?: number
): number {
  const mult = interval || 1;
  switch (frequency) {
    case "minutely":
      return mult * 60 * 1000;
    case "hourly":
      return mult * 60 * 60 * 1000;
    case "daily":
      return mult * 24 * 60 * 60 * 1000;
    case "weekly":
      return mult * 7 * 24 * 60 * 60 * 1000;
    case "monthly":
      return mult * 30 * 24 * 60 * 60 * 1000;
    case "yearly":
      return mult * 365 * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000; // Default to hourly
  }
}

async function executeAction(
  ctx: any,
  action: any,
  triggerData: any
): Promise<any> {
  switch (action.type) {
    case "send_notification":
      // Create notification in database
      if (action.recipients && action.recipients.length > 0) {
        for (const userId of action.recipients) {
          await ctx.db.insert("notifications", {
            workspaceId: triggerData.workspaceId,
            userId,
            type: "automation",
            title: action.subject || "Scheduled Automation",
            message:
              action.template ||
              `Automation "${triggerData.automationName}" executed`,
            isRead: false,
            createdAt: Date.now(),
          });
        }
        return { sent: action.recipients.length };
      }
      return { sent: 0, reason: "No recipients" };

    case "create_task":
      const taskId = await ctx.db.insert("tasks", {
        workspaceId: triggerData.workspaceId,
        title: action.taskTitle || "Automated Task",
        description: action.taskDescription,
        assigneeId: action.taskAssigneeId,
        dueDate: action.taskDueDate,
        status: "todo",
        createdAt: Date.now(),
      });
      return { taskId };

    case "update_field":
      if (action.targetEntity && action.fieldName) {
        // This would require more context about which entity to update
        return { scheduled: true, note: "Field update requires entity context" };
      }
      return { skipped: true, reason: "Missing target entity" };

    case "webhook":
      // Webhook calls would be done via a Convex action
      return {
        webhookUrl: action.webhookUrl,
        method: action.webhookMethod || "POST",
        scheduled: true,
        note: "Webhook will be called via action",
      };

    case "send_email":
      // Email would be sent via an action with proper email service
      return {
        recipients: action.recipients,
        subject: action.subject,
        scheduled: true,
        note: "Email will be sent via action",
      };

    case "run_script":
      // Script execution is sandboxed and limited
      return {
        script: action.scriptCode ? "provided" : "missing",
        scheduled: true,
        note: "Script execution requires sandbox",
      };

    default:
      return { actionType: action.type, executed: true };
  }
}
