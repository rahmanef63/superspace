import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiSettings = defineTable({
  workspaceId: v.string(),
  provider: v.string(), // openai, anthropic, etc.
  apiKey: v.string(),
  model: v.string(), // gpt-4, gpt-3.5-turbo, claude-2, etc.
  temperature: v.number(),
  maxTokens: v.number(),
  systemPrompt: v.optional(v.string()),
  rateLimit: v.optional(v.number()),
  status: v.string(), // active, disabled
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
})
  .index("by_workspace", ["workspaceId"]);

export const knowledgeBaseDocuments = defineTable({
  workspaceId: v.string(),
  sourceType: v.string(), // posts, portfolio, services, products, etc.
  sourceId: v.string(),
  title: v.string(),
  content: v.string(),
  url: v.optional(v.string()),
  locale: v.string(),
  metadata: v.optional(v.object({
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    embeddings: v.optional(v.array(v.number())),
  })),
  status: v.string(), // active, archived
  createdAt: v.number(),
  createdBy: v.optional(v.string()),
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_source", ["workspaceId", "sourceType", "sourceId"])
  .index("by_status", ["workspaceId", "status"]);

export const aiChatSessions = defineTable({
  workspaceId: v.string(),
  userId: v.string(),
  title: v.string(),
  messages: v.array(v.object({
    role: v.string(), // system, user, assistant
    content: v.string(),
    timestamp: v.number(),
    metadata: v.optional(v.object({
      tokenCount: v.optional(v.number()),
      contextIds: v.optional(v.array(v.string())),
    })),
  })),
  status: v.string(), // active, archived
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace_user", ["workspaceId", "userId"])
  .index("by_status", ["workspaceId", "status"]);

export const aiUsageStats = defineTable({
  workspaceId: v.string(),
  date: v.string(), // YYYY-MM-DD
  provider: v.string(),
  model: v.string(),
  requestCount: v.number(),
  tokenCount: v.number(),
  cost: v.number(),
  errors: v.number(),
})
  .index("by_workspace_date", ["workspaceId", "date"])
  .index("by_provider", ["workspaceId", "provider", "date"]);

export const aiTables = {
  aiSettings,
  knowledgeBaseDocuments,
  aiChatSessions,
  aiUsageStats,
};
