import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Update AI settings for a workspace
 */
export const updateSettings = mutation({
  args: {
    workspaceId: v.string(),
    provider: v.string(),
    apiKey: v.string(),
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
    systemPrompt: v.optional(v.string()),
    rateLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiSettings")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("aiSettings", {
      ...args,
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create a new chat session
 */
export const createChatSession = mutation({
  args: {
    workspaceId: v.optional(v.string()), // Optional for global sessions
    userId: v.string(),
    title: v.string(),
    isGlobal: v.optional(v.boolean()), // true for global/private sessions
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const session = await ctx.db.insert("aiChatSessions", {
      workspaceId: args.isGlobal ? undefined : args.workspaceId,
      userId: args.userId,
      title: args.title,
      isGlobal: args.isGlobal ?? false,
      messages: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(session);
  },
});

/**
 * Create or update a knowledge base document
 */
export const upsertKbDocument = mutation({
  args: {
    workspaceId: v.string(),
    sourceType: v.string(),
    sourceId: v.string(),
    title: v.string(),
    content: v.string(),
    url: v.optional(v.string()),
    locale: v.string(),
    metadata: v.optional(v.object({
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_source", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("sourceType", args.sourceType)
         .eq("sourceId", args.sourceId)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("knowledgeBaseDocuments", {
      ...args,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a knowledge base document
 */
export const deleteKbDocument = mutation({
  args: {
    documentId: v.id("knowledgeBaseDocuments"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId);
    return true;
  },
});

/**
 * Record AI usage statistics
 */
export const recordUsage = mutation({
  args: {
    workspaceId: v.string(),
    provider: v.string(),
    model: v.string(),
    requestCount: v.number(),
    tokenCount: v.number(),
    cost: v.number(),
    errors: v.number(),
  },
  handler: async (ctx, args) => {
    const date = new Date().toISOString().split("T")[0];
    
    const existing = await ctx.db
      .query("aiUsageStats")
      .withIndex("by_workspace_date", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("date", date)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        requestCount: existing.requestCount + args.requestCount,
        tokenCount: existing.tokenCount + args.tokenCount,
        cost: existing.cost + args.cost,
        errors: existing.errors + args.errors,
      });
    }

    return await ctx.db.insert("aiUsageStats", {
      ...args,
      date,
    });
  },
});

/**
 * Append a message to a chat session
 */
export const appendChatMessage = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    message: v.string(),
    role: v.string(),
    metadata: v.optional(v.object({
      tokenCount: v.optional(v.number()),
      contextIds: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    const messageEntry = {
      role: args.role,
      content: args.message,
      timestamp: Date.now(),
      metadata: args.metadata,
    };

    await ctx.db.patch(args.sessionId, {
      messages: [...session.messages, messageEntry],
      updatedAt: Date.now(),
    });

    return messageEntry;
  },
});

/**
 * Update chat session (title, status, etc.)
 */
export const updateChatSession = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch(args.sessionId, updates);

    return await ctx.db.get(args.sessionId);
  },
});
