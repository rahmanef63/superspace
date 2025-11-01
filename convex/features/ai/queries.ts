import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";

/**
 * Get AI settings for a workspace
 */
export const getSettings = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiSettings")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .unique();
  },
});

/**
 * Search knowledge base using semantic search
 */
export const searchKnowledgeBase = query({
  args: {
    workspaceId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // TODO: Implement vector search using embeddings
    // For now, return basic text search results
    const docs = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("status", "active"))
      .collect();

    // Basic text search (replace with vector search)
    const results = docs
      .filter(doc => 
        doc.title.toLowerCase().includes(args.query.toLowerCase()) ||
        doc.content.toLowerCase().includes(args.query.toLowerCase())
      )
      .slice(0, args.limit || 3);

    return results;
  },
});

/**
 * Get a specific chat session
 */
export const getChatSession = query({
  args: {
    sessionId: v.id("aiChatSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Chat session not found");
    return session;
  },
});

/**
 * List user's chat sessions
 */
export const listChatSessions = query({
  args: {
    workspaceId: v.string(),
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("aiChatSessions")
      .withIndex("by_workspace_user", (q: any) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      );

    if (args.status) {
      q = q.filter((q: any) => q.eq("status", args.status));
    }

    return await q.order("desc").collect();
  },
});

/**
 * Get knowledge base document
 */
export const getKbDocument = query({
  args: {
    workspaceId: v.string(),
    sourceType: v.string(),
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_source", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("sourceType", args.sourceType)
         .eq("sourceId", args.sourceId)
      )
      .unique();
  },
});

/**
 * Get similar documents from knowledge base
 */
export const getSimilarDocuments = query({
  args: {
    workspaceId: v.string(),
    sourceType: v.string(),
    content: v.string(),
    excludeId: v.id("knowledgeBaseDocuments"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement proper similarity search using embeddings
    // For now, return random docs of same type
    const docs = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_source", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("sourceType", args.sourceType)
      )
      .collect();

    const activeDocs = docs.filter(
      (doc) => doc._id !== args.excludeId && doc.status === "active",
    );

    // Add random similarity scores (replace with actual similarity calculation)
    const results = activeDocs.map(doc => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        similarity: Math.random(),
      },
    }));

    return results
      .sort((a, b) => (b.metadata?.similarity || 0) - (a.metadata?.similarity || 0))
      .slice(0, args.limit);
  },
});

/**
 * Get AI usage statistics
 */
export const getUsageStats = query({
  args: {
    workspaceId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("aiUsageStats")
      .withIndex("by_workspace_date", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .gte("date", args.startDate)
         .lte("date", args.endDate)
      );

    if (args.provider) {
      q = q.filter((q: any) => q.eq("provider", args.provider));
    }

    return await q.collect();
  },
});
