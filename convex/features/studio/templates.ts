import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { requireActiveMembership, ensureUser } from "../../auth/helpers";

/**
 * List workflow templates
 */
export const listTemplates = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Templates are public or shared, so we might not need strict workspace checks for listing
    // unless we have private workspace templates.
    // For now, return all public templates or filtered by category.

    if (args.category) {
      return await ctx.db.query("workflowTemplates")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    }

    return await ctx.db.query("workflowTemplates").collect();
  },
});

/**
 * Create a new workflow template
 */
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    definition: v.any(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, only admins might be allowed to create public templates
    // For now, allow any authenticated user to create one.

    return await ctx.db.insert("workflowTemplates", {
      name: args.name,
      description: args.description,
      category: args.category,
      definition: args.definition,
      isPublic: args.isPublic,
      createdBy: userId,
    });
  },
});

/**
 * Instantiate a workflow from a template
 */
export const useTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("workflowTemplates"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    const workflowId = await ctx.db.insert("workflows", {
      workspaceId: args.workspaceId,
      name: args.name || template.name,
      description: template.description,
      trigger: "manual", // Default to manual, user configures later
      status: "draft",
      definition: template.definition,
      createdBy: userId,
    });

    return workflowId;
  },
});
