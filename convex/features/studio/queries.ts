import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId } from "../../auth/helpers";

/**
 * Get all workflows in a workspace
 */
export const getWorkspaceWorkflows = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived"),
    )),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const { status } = args;
    const workflowsQuery =
      status !== undefined
        ? ctx.db
            .query("workflows")
            .withIndex("by_status", (q) => q.eq("status", status))
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        : ctx.db
            .query("workflows")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const workflows = await workflowsQuery.collect();

    const workflowsWithDetails = await Promise.all(
      workflows.map(async (workflow) => {
        const creator = await ctx.db.get(workflow.createdBy);

        // Get execution stats
        const executions = await ctx.db
          .query("workflowExecutions")
          .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
          .collect();

        const successCount = executions.filter(e => e.status === "completed").length;
        const failedCount = executions.filter(e => e.status === "failed").length;

        return {
          ...workflow,
          creator,
          executionStats: {
            total: executions.length,
            success: successCount,
            failed: failedCount,
          },
        };
      })
    );

    return workflowsWithDetails;
  },
});

/**
 * Get a single workflow with full details
 */
export const getWorkflow = query({
  args: {
    workflowId: v.id("workflows"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) return null;

    const creator = await ctx.db.get(workflow.createdBy);

    // Get recent executions
    const executions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .order("desc")
      .take(10);

    const executionsWithDetails = await Promise.all(
      executions.map(async (execution) => {
        const triggeredBy = await ctx.db.get(execution.triggeredBy);
        return {
          ...execution,
          triggeredBy,
        };
      })
    );

    return {
      ...workflow,
      creator,
      recentExecutions: executionsWithDetails,
    };
  },
});

/**
 * Get workflow executions
 */
export const getWorkflowExecutions = query({
  args: {
    workflowId: v.id("workflows"),
    status: v.optional(v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const { status } = args;
    const executionsQuery =
      status !== undefined
        ? ctx.db
            .query("workflowExecutions")
            .withIndex("by_status", (q) => q.eq("status", status))
            .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
        : ctx.db
            .query("workflowExecutions")
            .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId));

    const executions = await executionsQuery
      .order("desc")
      .take(args.limit || 20);

    const executionsWithDetails = await Promise.all(
      executions.map(async (execution) => {
        const triggeredBy = await ctx.db.get(execution.triggeredBy);
        return {
          ...execution,
          triggeredBy,
        };
      })
    );

    return executionsWithDetails;
  },
});
