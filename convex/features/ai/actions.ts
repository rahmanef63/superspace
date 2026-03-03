import { action } from "../../_generated/server";
import type { ActionCtx } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { api } from "../../_generated/api";
import { generateText, tool, CoreMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { generateEmbedding } from "./lib/embeddings";
import { featureAgentRegistry } from "./registry";

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
  returns: v.object({
    message: v.string(),
    sessionId: v.id("aiChatSessions"),
    contextIds: v.array(v.id("knowledgeBaseDocuments")),
  }),
  handler: async (
    ctx: ActionCtx,
    args: ChatArgs
  ): Promise<{
    message: string;
    sessionId: Id<"aiChatSessions">;
    contextIds: Id<"knowledgeBaseDocuments">[];
  }> => {
    // Get AI settings
    const settings: AiSettingsDoc | null = await ctx.runQuery(
      (api as any).features.ai.queries.getSettings,
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
      const session = await ctx.runMutation((api as any).features.ai.mutations.createChatSession, {
        workspaceId: args.workspaceId,
        userId: args.userId,
        title: args.message.slice(0, 50) + "...",
      }) as ChatSessionDoc;
      sessionId = session._id as Id<"aiChatSessions">;
    }

    // 1. Generate Embedding for RAG
    let embedding: number[] | undefined;
    try {
      embedding = await generateEmbedding(args.message, settings.apiKey);
    } catch (e) {
      console.error("Failed to generate embedding:", e);
      // Fallback to text search if embedding fails
    }

    // 2. Prepare context from knowledge base
    const relevantDocs = await ctx.runQuery((api as any).features.ai.queries.searchKnowledgeBase, {
      workspaceId: args.workspaceId,
      query: args.message,
      embedding,
      limit: 3,
    }) as KnowledgeBaseDoc[];

    // Get chat history
    const session = await ctx.runQuery((api as any).features.ai.queries.getChatSession, {
      sessionId,
    }) as ChatSessionDoc;

    // Format messages for AI
    const history: CoreMessage[] = session.messages.map(m => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content
    }));

    const systemContent = settings.systemPrompt || "You are a helpful assistant.";
    const contextContent = relevantDocs.length > 0
      ? "\n\nContext from knowledge base:\n" + relevantDocs.map((doc) => "- " + doc.title + ":\n" + doc.content).join("\n\n")
      : "";

    const messages: CoreMessage[] = [
      { role: "system", content: systemContent + contextContent },
      ...history,
      { role: "user", content: args.message },
    ];

    // 3. Prepare Tools
    const tools: Record<string, any> = {};
    for (const [feature, agent] of Object.entries(featureAgentRegistry)) {
      for (const [name, def] of Object.entries(agent.tools)) {
        tools[`${feature}_${name}`] = tool({
          description: def.description,
          parameters: def.args as any,
          execute: async (toolArgs: any) => {
            console.log(`Executing tool ${feature}.${name}`, toolArgs);
            // Ensure workspaceId is present if needed
            if (toolArgs.workspaceId && toolArgs.workspaceId !== args.workspaceId) {
              throw new Error(`Access denied: Cannot access workspace ${toolArgs.workspaceId}`);
            }

            // Check for Approval Mode
            if (settings.requiresApproval && def.type === "mutation") {
              await ctx.runMutation((api as any).features.ai.mutations.createApprovalRequest, {
                workspaceId: args.workspaceId,
                agentId: feature,
                toolName: name,
                args: JSON.stringify(toolArgs),
              });
              return { status: "pending_approval", message: "Action requires approval. A request has been sent to the workspace admin." };
            }

            if (def.type === "mutation") {
              return await ctx.runMutation(def.handler, toolArgs);
            } else {
              return await ctx.runQuery(def.handler, toolArgs);
            }
          }
        } as any);
      }
    }

    // Add Handoff Tool
    // Note: We use Zod for tool parameters as required by AI SDK, not Convex validators
    const { z } = require("zod");
    tools["system_handoff"] = tool({
      description: "Hand off the conversation to a specialized agent or human. Use this when you cannot handle the request.",
      parameters: z.object({ reason: z.string() }),
      execute: async ({ reason }: { reason: string }) => {
        return { status: "handed_off", message: `Conversation handed off: ${reason}` };
      }
    } as any);

    try {
      // 4. Call AI with Tools
      const openai = createOpenAI({ apiKey: settings.apiKey });

      // Fallback Logic
      let model = openai(settings.model);
      if (settings.model.includes("gpt-4")) {
        // Simple fallback strategy: if GPT-4 fails, we might want to try 3.5 (though usually we want to retry the same model)
        // For now, we'll stick to the configured model but wrap in try/catch for specific errors
      }

      const result = await generateText({
        model,
        messages,
        tools,
      });

      // Record the interaction
      await ctx.runMutation((api as any).features.ai.mutations.appendChatMessage, {
        sessionId,
        message: args.message,
        role: "user",
      });

      // We only store the final response for now to match schema
      // Ideally we should store the full trace (tool calls)
      await ctx.runMutation((api as any).features.ai.mutations.appendChatMessage, {
        sessionId,
        message: result.text,
        role: "assistant",
      });

      // Record usage stats
      await ctx.runMutation((api as any).features.ai.mutations.recordUsage, {
        workspaceId: args.workspaceId,
        provider: settings.provider,
        model: settings.model,
        requestCount: 1,
        tokenCount: result.usage.totalTokens,
        cost: 0, // Calculate based on model
        errors: 0,
      });

      return {
        message: result.text,
        sessionId,
        contextIds: relevantDocs.map((doc) => doc._id as Id<"knowledgeBaseDocuments">),
      };
    } catch (error) {
      console.error("AI Error:", error);
      // Record error in usage stats
      await ctx.runMutation((api as any).features.ai.mutations.recordUsage, {
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
  returns: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      url: v.optional(v.string()),
      similarity: v.number(),
    })
  ),
  handler: async (
    ctx: ActionCtx,
    args: RecommendArgs
  ): Promise<
    Array<{
      id: string;
      title: string;
      url: string | undefined;
      similarity: number;
    }>
  > => {
    // Get source document
    const source = await ctx.runQuery((api as any).features.ai.queries.getKbDocument, {
      workspaceId: args.workspaceId,
      sourceType: args.sourceType,
      sourceId: args.sourceId,
    }) as KnowledgeBaseDoc | null;

    if (!source) {
      throw new Error("Source document not found");
    }

    // Get similar documents based on content
    const recommendations = await ctx.runQuery((api as any).features.ai.queries.getSimilarDocuments, {
      workspaceId: args.workspaceId,
      sourceType: args.sourceType,
      content: source.content,
      excludeId: source._id,
      limit: args.count,
    }) as any[];

    return recommendations.map((doc: any) => ({
      id: doc.sourceId,
      title: doc.title,
      url: doc.url,
      similarity: doc.metadata?.similarity || 0,
    }));
  },
});



/**
 * Gateway for Feature Agents
 * Securely routes AI tool calls to feature-specific logic with Runtime Validation
 */
export const callFeatureAgent = action({
  args: {
    workspaceId: v.id("workspaces"),
    feature: v.string(), // e.g. "documents"
    tool: v.string(),    // e.g. "create"
    args: v.any(),       // JSON arguments
  },
  returns: v.any(), // Returning generic results based on the tool called
  handler: async (
    ctx: ActionCtx,
    args: any
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    details?: any;
    schemaDescription?: string;
  }> => {
    // 1. Verify Access
    await ctx.runQuery((api as any).features.ai.queries.checkAgentAccess, {
      workspaceId: args.workspaceId
    });

    // 2. Lookup Feature Agent
    const agent = featureAgentRegistry[args.feature];
    if (!agent) {
      // Structured failure for AI
      return {
        success: false,
        error: `Feature agent '${args.feature}' not found. Available: ${Object.keys(featureAgentRegistry).join(", ")}`
      };
    }

    // 3. Lookup Tool
    const toolDef = agent.tools[args.tool];
    if (!toolDef) {
      return {
        success: false,
        error: `Tool '${args.tool}' not found in feature '${args.feature}'. Available: ${Object.keys(agent.tools).join(", ")}`
      };
    }

    // 4. Runtime Validation (Strict Zod)
    const validation = toolDef.args.safeParse(args.args);
    if (!validation.success) {
      console.warn(`[AI Gateway] Validation Failed for ${args.feature}.${args.tool}`, validation.error.format());
      return {
        success: false,
        error: "Validation Failed",
        details: validation.error.format(),
        schemaDescription: toolDef.description
      };
    }

    // 5. Execution
    try {
      let result;
      // We allow the handler to be either a mutation or query
      if (toolDef.type === "mutation") {
        result = await ctx.runMutation(toolDef.handler, validation.data);
      } else {
        result = await ctx.runQuery(toolDef.handler, validation.data);
      }

      return {
        success: true,
        data: result
      };

    } catch (error: any) {
      console.error(`[AI Gateway] Execution Error [${args.feature}.${args.tool}]`, error);
      return {
        success: false,
        error: error.message || "Unknown execution error"
      };
    }
  }
});
