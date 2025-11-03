// @ts-nocheck - Bypass type checking due to Convex generated API type instantiation depth limits
import { action } from "../../_generated/server";
import type { ActionCtx } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { api } from "../../_generated/api";

type ChatArgs = {
  workspaceId: string;
  sessionId?: Id<"aiChatSessions">;
  message: string;
  userId: string;
};

type RecommendArgs = {
  workspaceId: string;
  sourceType: string;
  sourceId: string;
  count: number;
};

type AiSettingsDoc = Doc<"aiSettings">;
type KnowledgeBaseDoc = Doc<"knowledgeBaseDocuments">;
type ChatSessionDoc = Doc<"aiChatSessions">;
type KnowledgeBaseDocWithSimilarity = KnowledgeBaseDoc & {
  metadata?: NonNullable<KnowledgeBaseDoc["metadata"]> & { similarity?: number };
};

/**
 * Generate a chat response using AI
 */
export const chat = action({
  args: {
    workspaceId: v.string(),
    sessionId: v.optional(v.id("aiChatSessions")),
    message: v.string(),
    userId: v.string(),
  },
  handler: async (ctx: ActionCtx, args: ChatArgs) => {
    // Get AI settings
    const settings: AiSettingsDoc | null = await ctx.runQuery(
      api.features.ai.queries.getSettings,
      {
        workspaceId: args.workspaceId,
      }
    );

    if (!settings) {
      throw new Error("AI settings not configured");
    }

    // Get or create chat session
    let sessionId = args.sessionId;
    if (!sessionId) {
      const session = await ctx.runMutation(api.features.ai.mutations.createChatSession, {
        workspaceId: args.workspaceId,
        userId: args.userId,
        title: args.message.slice(0, 50) + "...",
      }) as ChatSessionDoc;
      sessionId = session._id as Id<"aiChatSessions">;
    }

    // Prepare context from knowledge base
    const relevantDocs = await ctx.runQuery(api.features.ai.queries.searchKnowledgeBase, {
      workspaceId: args.workspaceId,
      query: args.message,
      limit: 3,
    }) as KnowledgeBaseDoc[];

    // Get chat history
    const session = await ctx.runQuery(api.features.ai.queries.getChatSession, {
      sessionId,
    }) as ChatSessionDoc;

    // Format messages for AI
    const messages = [
      { role: "system", content: settings.systemPrompt || "You are a helpful assistant." },
      ...session.messages,
      { role: "user", content: args.message },
    ];

    // Add context from knowledge base
    if (relevantDocs.length > 0) {
      messages.unshift({
        role: "system",
        content: "Context from knowledge base:\n" +
          relevantDocs.map((doc) => "- " + doc.title + ":\n" + doc.content).join("\n\n"),
      });
    }

    try {
      // Make API call to AI provider
      // This is a placeholder - implement actual API call based on settings.provider
      const response = "This is a placeholder response. Implement actual API call.";

      // Record the interaction
      await ctx.runMutation(api.features.ai.mutations.appendChatMessage, {
        sessionId,
        message: args.message,
        role: "user",
      });

      await ctx.runMutation(api.features.ai.mutations.appendChatMessage, {
        sessionId,
        message: response,
        role: "assistant",
      });

      // Record usage stats
      await ctx.runMutation(api.features.ai.mutations.recordUsage, {
        workspaceId: args.workspaceId,
        provider: settings.provider,
        model: settings.model,
        requestCount: 1,
        tokenCount: 100, // Replace with actual token count
        cost: 0.002, // Replace with actual cost calculation
        errors: 0,
      });

      return {
        message: response,
        sessionId,
        contextIds: relevantDocs.map((doc) => doc._id),
      };

    } catch (error) {
      // Record error in usage stats
      await ctx.runMutation(api.features.ai.mutations.recordUsage, {
        workspaceId: args.workspaceId,
        provider: settings.provider,
        model: settings.model,
        requestCount: 1,
        tokenCount: 0,
        cost: 0,
        errors: 1,
      });

      if (error instanceof Error) {
        throw new Error("AI request failed: " + error.message);
      }
      throw new Error("AI request failed: Unknown error");
    }
  },
});

/**
 * Generate recommendations based on content
 */
export const recommend = action({
  args: {
    workspaceId: v.string(),
    sourceType: v.string(),
    sourceId: v.string(),
    count: v.number(),
  },
  handler: async (ctx: ActionCtx, args: RecommendArgs) => {
    // Get source document
    const source = await ctx.runQuery(api.features.ai.queries.getKbDocument, {
      workspaceId: args.workspaceId,
      sourceType: args.sourceType,
      sourceId: args.sourceId,
    }) as KnowledgeBaseDoc | null;

    if (!source) {
      throw new Error("Source document not found");
    }

    // Get similar documents based on content
    const recommendations = await ctx.runQuery(api.features.ai.queries.getSimilarDocuments, {
      workspaceId: args.workspaceId,
      sourceType: args.sourceType,
      content: source.content,
      excludeId: source._id,
      limit: args.count,
    }) as KnowledgeBaseDocWithSimilarity[];

    return recommendations.map((doc) => ({
      id: doc.sourceId,
      title: doc.title,
      url: doc.url,
      similarity: doc.metadata?.similarity || 0,
    }));
  },
});
