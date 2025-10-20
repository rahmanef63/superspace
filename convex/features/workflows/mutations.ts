import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser } from "../../auth/helpers";

/**
 * Create a new workflow
 */
export const createWorkflow = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.union(
      v.literal("manual"),
      v.literal("schedule"),
      v.literal("event"),
    ),
    definition: v.object({
      steps: v.array(v.object({
        id: v.string(),
        type: v.string(),
        config: v.any(),
      })),
    }),
  },
  returns: v.id("workflows"),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workflowId = await ctx.db.insert("workflows", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      trigger: args.trigger,
      status: "draft",
      definition: args.definition,
      createdBy: userId,
    });

    return workflowId;
  },
});

/**
 * Update workflow
 */
export const updateWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.union(
      v.literal("manual"),
      v.literal("schedule"),
      v.literal("event"),
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived"),
    )),
    definition: v.optional(v.object({
      steps: v.array(v.object({
        id: v.string(),
        type: v.string(),
        config: v.any(),
      })),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    if (workflow.createdBy !== userId) {
      throw new Error("Not authorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.trigger !== undefined) updates.trigger = args.trigger;
    if (args.status !== undefined) updates.status = args.status;
    if (args.definition !== undefined) updates.definition = args.definition;

    await ctx.db.patch(args.workflowId, updates);

    return null;
  },
});

/**
 * Execute workflow manually
 */
export const executeWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
  },
  returns: v.id("workflowExecutions"),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    if (workflow.status !== "active") {
      throw new Error("Workflow is not active");
    }

    const executionId = await ctx.db.insert("workflowExecutions", {
      workflowId: args.workflowId,
      workspaceId: workflow.workspaceId,
      status: "running",
      startedAt: Date.now(),
      triggeredBy: userId,
      logs: [{
        timestamp: Date.now(),
        level: "info",
        message: "Workflow execution started",
      }],
    });

    // Update workflow metadata
    await ctx.db.patch(args.workflowId, {
      metadata: {
        ...workflow.metadata,
        lastRunAt: Date.now(),
        runCount: (workflow.metadata?.runCount || 0) + 1,
      },
    });

    // TODO: Implement actual workflow execution logic
    // For now, we just mark it as completed
    setTimeout(async () => {
      try {
        await ctx.db.patch(executionId, {
          status: "completed",
          completedAt: Date.now(),
          result: { success: true },
        });
      } catch (e) {
        console.error("Failed to update execution:", e);
      }
    }, 1000);

    return executionId;
  },
});

/**
 * Cancel workflow execution
 */
export const cancelExecution = mutation({
  args: {
    executionId: v.id("workflowExecutions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const execution = await ctx.db.get(args.executionId);
    if (!execution) throw new Error("Execution not found");

    if (execution.status !== "running") {
      throw new Error("Execution is not running");
    }

    await ctx.db.patch(args.executionId, {
      status: "cancelled",
      completedAt: Date.now(),
      error: "Cancelled by user",
    });

    return null;
  },
});

/**
 * Delete workflow
 */
export const deleteWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");

    if (workflow.createdBy !== userId) {
      throw new Error("Not authorized");
    }

    // Check if there are running executions
    const runningExecutions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .filter((q) => q.eq(q.field("status"), "running"))
      .collect();

    if (runningExecutions.length > 0) {
      throw new Error("Cannot delete workflow with running executions");
    }

    await ctx.db.delete(args.workflowId);

    return null;
  },
});
