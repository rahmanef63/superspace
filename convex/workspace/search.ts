import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireActiveMembership } from "../auth/helpers";

// Global search across workspace content
export const globalSearch = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const results = [];

    // Search documents
    const documents = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) =>
        q.search("title", args.query).eq("workspaceId", args.workspaceId)
      )
      .take(10);

    results.push(...documents.map(doc => ({
      id: doc._id,
      type: "document" as const,
      title: doc.title,
      description: doc.metadata?.description || "Document",
      url: `/documents/${doc._id}`,
    })));

    // Search messages
    const messages = await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query)
      )
      .take(10);

    // Get conversations for messages
    const conversationIds = [...new Set(messages.map(m => m.conversationId))];
    const conversations = await Promise.all(
      conversationIds.map(id => ctx.db.get(id))
    );

    const conversationMap = new Map(
      conversations.filter(Boolean).map(c => [c!._id, c!])
    );

    results.push(...messages
      .filter(msg => {
        const conv = conversationMap.get(msg.conversationId);
        return conv && conv.workspaceId === args.workspaceId;
      })
      .map(msg => ({
        id: msg._id,
        type: "conversation" as const,
        title: conversationMap.get(msg.conversationId)?.name || "Conversation",
        description: msg.content.substring(0, 100) + "...",
        url: `/chat/${msg.conversationId}`,
      }))
    );

    // Search workspace members
    const members = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const users = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return user && (
          user.name?.toLowerCase().includes(args.query.toLowerCase()) ||
          user.email?.toLowerCase().includes(args.query.toLowerCase())
        ) ? {
          id: user._id,
          type: "user" as const,
          title: user.name || user.email || "User",
          description: user.email || "Workspace member",
          url: `/members/${user._id}`,
        } : null;
      })
    );

    results.push(...users.filter(Boolean));

    return results.slice(0, 20);
  },
});
