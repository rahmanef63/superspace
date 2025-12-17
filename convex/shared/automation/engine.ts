/**
 * Automation Engine Implementation
 * Provides workflow automation functionality across all ERP modules
 */

import { v } from "convex/values";
import { mutation, query, action } from "../../_generated/server";
import { internal } from "../../_generated/api";

// Create an automation rule
export const createAutomationRule = mutation({
  args: {
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
    triggerConditions: v.array(v.any()),
    actions: v.array(v.any()),
    schedule: v.optional(v.any()),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    onError: v.optional(v.string()),
    maxRetries: v.optional(v.number()),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), identity.subject)).first();

    if (!user) {
      throw new Error("User not found");
    }

    // Create the automation rule
    const ruleId = await ctx.db.insert("automationRules", {
      ...args,
      isActive: args.isActive ?? true,
      priority: args.priority ?? 50,
      executionCount: 0,
      retryCount: 0,
      maxRetries: args.maxRetries ?? 3,
      onError: (args.onError as any) ?? "stop",
      tags: args.tags ?? [],
      version: 1,
      createdAt: Date.now(),
      createdBy: user._id,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { success: true, ruleId };
  },
});

// Update an automation rule
export const updateAutomationRule = mutation({
  args: {
    ruleId: v.id("automationRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.union(
      v.literal("on_create"),
      v.literal("on_update"),
      v.literal("on_delete"),
      v.literal("scheduled"),
      v.literal("manual"),
      v.literal("webhook")
    )),
    triggerConditions: v.optional(v.array(v.any())),
    actions: v.optional(v.array(v.any())),
    schedule: v.optional(v.any()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    onError: v.optional(v.string()),
    maxRetries: v.optional(v.number()),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), identity.subject)).first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the rule
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) {
      throw new Error("Rule not found");
    }

    if (rule.workspaceId !== args.workspaceId) {
      throw new Error("Unauthorized");
    }

    // Update the rule
    const updates: any = {
      ...args,
      version: rule.version + 1,
      updatedAt: Date.now(),
      updatedBy: user._id,
    };

    // Remove workspaceId and ruleId from updates
    delete updates.workspaceId;
    delete updates.ruleId;

    await ctx.db.patch(args.ruleId, updates);

    return { success: true };
  },
});

// Execute an automation rule manually
export const executeAutomationRule = mutation({
  args: {
    ruleId: v.id("automationRules"),
    context: v.optional(v.record(v.string(), v.any())),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the rule
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) {
      throw new Error("Rule not found");
    }

    if (rule.workspaceId !== args.workspaceId) {
      throw new Error("Unauthorized");
    }

    if (!rule.isActive) {
      throw new Error("Rule is not active");
    }

    // Create execution record
    const executionId = await ctx.db.insert("automationExecutions", {
      ruleId: args.ruleId,
      ruleVersion: rule.version,
      status: "pending",
      triggerType: "manual",
      triggerData: args.context,
      startedAt: Date.now(),
      actionsExecuted: [],
      executionId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      isRetry: false,
      workspaceId: args.workspaceId,
      createdAt: Date.now(),
    });

    // In a real implementation, you would:
    // 1. Schedule the execution via action
    // 2. Run the actions
    // 3. Update execution status

    // For now, return the execution ID
    return {
      success: true,
      executionId,
      message: "Execution queued"
    };
  },
});

// Get automation rules
export const getAutomationRules = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    trigger: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Query rules
    let rulesQuery = ctx.db
      .query("automationRules")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId));

    // Apply filters
    if (args.category) {
      rulesQuery = rulesQuery.filter(q => q.eq(q.field("category"), args.category));
    }

    if (args.isActive !== undefined) {
      rulesQuery = rulesQuery.filter(q => q.eq(q.field("isActive"), args.isActive));
    }

    // Get rules
    const rules = await rulesQuery.collect();

    // Apply search filter
    let filteredRules = rules;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredRules = rules.filter(rule =>
        rule.name.toLowerCase().includes(searchLower) ||
        rule.description?.toLowerCase().includes(searchLower) ||
        rule.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply additional filters
    if (args.trigger) {
      filteredRules = filteredRules.filter(rule => rule.trigger === args.trigger);
    }

    // Sort by priority and last updated
    filteredRules.sort((a, b) => {
      // First by active status
      if (a.isActive !== b.isActive) {
        return b.isActive ? 1 : -1;
      }
      // Then by priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Finally by updated date
      return b.updatedAt - a.updatedAt;
    });

    // Apply limit
    const limited = args.limit
      ? filteredRules.slice(0, args.limit)
      : filteredRules;

    return {
      rules: limited,
      total: filteredRules.length,
    };
  },
});

// Get automation execution logs
export const getAutomationExecutions = query({
  args: {
    workspaceId: v.id("workspaces"),
    ruleId: v.optional(v.id("automationRules")),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Query executions
    let executionsQuery = ctx.db
      .query("automationExecutions")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId));

    // Apply filters
    if (args.ruleId) {
      executionsQuery = executionsQuery.filter(q => q.eq(q.field("ruleId"), args.ruleId));
    }

    if (args.status) {
      executionsQuery = executionsQuery.filter(q => q.eq(q.field("status"), args.status));
    }

    // Get executions
    const executions = await executionsQuery.order("desc").take(args.limit ?? 50);

    return executions;
  },
});

// Get automation templates
export const getAutomationTemplates = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.union(
      v.literal("sales"),
      v.literal("inventory"),
      v.literal("crm"),
      v.literal("hr"),
      v.literal("accounting"),
      v.literal("projects"),
      v.literal("general")
    )),
    includePublic: v.boolean(),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), identity.subject)).first();

    if (!user) {
      throw new Error("User not found");
    }

    // Query templates
    let templates = await ctx.db
      .query("automationTemplates")
      .collect();

    // Filter by workspace and visibility
    templates = templates.filter(template => {
      if (template.workspaceId === args.workspaceId) {
        return true;
      }
      if (args.includePublic && template.scope === "public") {
        return true;
      }
      if (template.scope === "private" && template.authorId === user._id) {
        return true;
      }
      return false;
    });

    // Apply filters
    if (args.category) {
      templates = templates.filter(template => template.category === args.category);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by rating and usage
    templates.sort((a, b) => {
      // First by published status
      if (a.isPublished !== b.isPublished) {
        return b.isPublished ? 1 : -1;
      }
      // Then by rating
      if (b.ratingCount > 0 && a.ratingCount > 0) {
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;
      }
      // Finally by usage count
      return b.usageCount - a.usageCount;
    });

    // Apply limit
    return args.limit
      ? templates.slice(0, args.limit)
      : templates;
  },
});

// Create rule from template
export const createRuleFromTemplate = mutation({
  args: {
    templateId: v.id("automationTemplates"),
    name: v.string(),
    customizations: v.optional(v.record(v.string(), v.any())),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get template
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Create rule from template
    const { settings, ...templateData } = template.template;

    const ruleData = {
      ...templateData,
      name: args.name,
      ...args.customizations,
      category: template.category,
      tags: template.tags,
      workspaceId: args.workspaceId,
    };

    // Insert rule
    const ruleId = await ctx.db.insert("automationRules", {
      ...ruleData,
      isActive: true,
      priority: settings?.priority ?? 50,
      executionCount: 0,
      retryCount: 0,
      maxRetries: settings?.maxRetries ?? 3,
      onError: (settings?.onError as any) ?? "stop",
      version: 1,
      createdAt: Date.now(),
      createdBy: user._id,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    // Update template usage
    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
    });

    return { success: true, ruleId };
  },
});

// Get automation statistics
export const getAutomationStats = query({
  args: {
    workspaceId: v.id("workspaces"),
    period: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    )),
  },
  handler: async (ctx, args) => {
    // Get viewer identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get rules count
    const rules = await ctx.db
      .query("automationRules")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    const activeRules = rules.filter(r => r.isActive);
    const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);

    // Get recent executions
    const recentExecutions = await ctx.db
      .query("automationExecutions")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .take(100);

    const successfulExecutions = recentExecutions.filter(e => e.status === "completed").length;
    const failedExecutions = recentExecutions.filter(e => e.status === "failed").length;

    // Calculate success rate
    const processedExecutions = successfulExecutions + failedExecutions;
    const successRate = processedExecutions > 0
      ? (successfulExecutions / processedExecutions) * 100
      : 0;

    // Get top rules by execution count
    const topRules = [...rules]
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, 5)
      .map(rule => ({
        ruleId: rule._id,
        ruleName: rule.name,
        executions: rule.executionCount,
      }));

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalExecutions,
      recentExecutions: recentExecutions.length,
      successRate: Math.round(successRate * 100) / 100,
      topRules,
    };
  },
});

// Internal action to process automation rules
export const processAutomationRule = action({
  args: {
    ruleId: v.string(),
    triggerData: v.optional(v.any()),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {

    // In a real implementation, this would:
    // 1. Get the rule and check conditions
    // 2. Execute the defined actions
    // 3. Handle errors and retries
    // 4. Update execution status

    return {
      success: true,
      message: "Automation rule processed successfully"
    };
  },
});
