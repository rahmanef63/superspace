import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";

/**
 * Check for breached SLAs and escalate or notify
 * Should be run by a cron job periodically (e.g. every hour)
 */
export const checkSLABreaches = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Check running workflow executions that have exceeded SLA
    const runningExecutions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();

    for (const execution of runningExecutions) {
      const workflow = await ctx.db.get(execution.workflowId);
      if (!workflow || !workflow.definition?.settings?.slaDurationMs) continue;

      const slaDuration = workflow.definition.settings.slaDurationMs;
      const duration = now - execution.startedAt;

      if (duration > slaDuration) {
        // SLA Breached
        console.log(`SLA Breach: Execution ${execution._id} exceeded ${slaDuration}ms`);

        // Log breach
        const logs = execution.logs || [];
        logs.push({
          timestamp: now,
          level: "error",
          message: `SLA BREACH: Workflow exceeded max duration of ${slaDuration}ms`,
        });

        await ctx.db.patch(execution._id, { logs });

        // Notify workspace admins (placeholder logic)
        await ctx.db.insert("notifications", {
          workspaceId: execution.workspaceId,
          userId: execution.triggeredBy, // Notify triggerer for now
          createdBy: execution.triggeredBy, // System notification attributed to triggerer or system user
          type: "system",
          title: "SLA Breach Alert",
          message: `Workflow "${workflow.name}" has exceeded its SLA duration.`,
          isRead: false,
        });

        // Escalation Logic: Reassign pending tasks
        // If the workflow has an escalation policy (e.g. reassign to manager)
        const settings = workflow.definition?.settings as any;
        if (settings?.escalationUserId) {
            const pendingTasks = await ctx.db
                .query("tasks")
                .withIndex("by_workspace", (q) => q.eq("workspaceId", execution.workspaceId))
                .filter((q) => q.eq(q.field("status"), "todo"))
                .collect();
            
            // Filter tasks created by this workflow execution (heuristic or if we tracked it)
            // For now, we'll assume we can't easily link tasks to execution without a new field.
            // But we can log the intent.
            
            console.log(`Escalating workflow ${workflow._id} to user ${settings.escalationUserId}`);
            
            // In a real implementation, we would update the 'assignedTo' field of relevant tasks
            // await ctx.db.patch(taskId, { assignedTo: settings.escalationUserId });
        }
      }
    }
  },
});
