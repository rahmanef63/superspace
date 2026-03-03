import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";

/**
 * Trigger a workflow for multiple items (Bulk Automation)
 */
export const triggerBulkWorkflow = internalMutation({
  args: {
    workflowId: v.id("workflows"),
    items: v.array(v.any()), // Array of items to process
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    const now = Date.now();
    const executionIds = [];

    // Create an execution for each item
    for (const item of args.items) {
      const executionId = await ctx.db.insert("workflowExecutions", {
        workflowId: args.workflowId,
        workspaceId: workflow.workspaceId,
        status: "running",
        startedAt: now,
        triggeredBy: args.userId,
        logs: [{
          timestamp: now,
          level: "info",
          message: `Bulk execution started for item: ${JSON.stringify(item).slice(0, 50)}...`,
        }],
        // Pass the item as initial context/variable
        result: { triggerItem: item },
      });

      executionIds.push(executionId);

      // Schedule execution
      await ctx.scheduler.runAfter(0, internal.features.studio.executor.processExecution, {
        executionId,
      });
    }

    return executionIds;
  },
});
