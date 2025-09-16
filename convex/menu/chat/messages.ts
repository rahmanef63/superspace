import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { ensureUser, getExistingUserId, resolveCandidateUserIds } from "../../auth/helpers";

// Get conversation messages
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // Only allow reading messages if you are a participant (by any candidate id)
    const candidates = await resolveCandidateUserIds(ctx);
    let isParticipant = false;
    for (const idStr of candidates) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      if (p) { isParticipant = true; break; }
    }
    if (!isParticipant) return [];

    let q = ctx.db
      .query("messages")
      .withIndex("by_conversation", (qb) => qb.eq("conversationId", args.conversationId))
      .filter((qb) => qb.eq(qb.field("deletedAt"), undefined))
      .order("desc");

    if (args.before) {
      q = q.filter((qb) => qb.lt(qb.field("_creationTime"), args.before!));
    }

    const messages = await q.take(args.limit || 50);

    const withDetails = await Promise.all(
      messages.map(async (message) => {
        const author = message.senderId ? await ctx.db.get(message.senderId) : null;
        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_message", (qb) => qb.eq("messageId", message._id))
          .collect();

        const grouped = reactions.reduce((acc: Record<string, { emoji: string; count: number; users: any[] }>, r: any) => {
          if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
          acc[r.emoji].count += 1;
          acc[r.emoji].users.push(r.userId);
          return acc;
        }, {});

        return {
          ...message,
          author,           // keep for backward compatibility
          sender: author,   // new alias
          reactions: Object.values(grouped),
        } as any;
      })
    );

    return withDetails.reverse();
  },
});

// Get recent messages for notifications
export const getRecentMessages = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // Get conversations in this workspace
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length === 0) return [];

    // Get recent messages from all conversations
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .take(args.limit || 10);

    // Filter messages that belong to workspace conversations
    const workspaceMessages = messages.filter(msg => 
      conversationIds.includes(msg.conversationId)
    );

    // Get author information
    const messagesWithAuthors = await Promise.all(
      workspaceMessages.map(async (message) => {
        const author = message.senderId ? await ctx.db.get(message.senderId) : null;
        return {
          ...message,
          author,
        };
      })
    );

    return messagesWithAuthors;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("file"))),
    fileId: v.optional(v.id("_storage")),
    replyToId: v.optional(v.id("messages")),
    metadata: v.optional(v.object({
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      storageIds: v.optional(v.array(v.string())),
      fileNames: v.optional(v.array(v.string())),
      fileSizes: v.optional(v.array(v.number())),
      mimeTypes: v.optional(v.array(v.string())),
      aiModel: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is part of the conversation
    const convMeta = await ctx.db.get(args.conversationId);
    if (!convMeta) throw new Error("Conversation not found");

    // Check if user is a participant (by any candidate id to account for legacy rows)
    const candidateIds = await resolveCandidateUserIds(ctx);
    let participant: any = null;
    for (const idStr of candidateIds) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) => 
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .first();
      if (p && p.isActive) { participant = p; break; }
    }
    if (!participant) throw new Error("Not authorized to send messages in this conversation");

    // Heal: ensure a participation row exists for the current userId
    if (participant.userId !== userId) {
      const existingForCurrent = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", userId).eq("conversationId", args.conversationId)
        )
        .first();
      if (!existingForCurrent) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: args.conversationId,
          userId,
          role: "member",
          joinedAt: Date.now(),
          isActive: true,
        });
      }
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      type: args.type || "text",
      replyToId: args.replyToId,
      metadata: args.metadata ?? (args.fileId ? { storageId: args.fileId } : undefined),
    });

    // Update conversation's last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    // Optional AI response scheduling
    const convForAi = await ctx.db.get(args.conversationId);
    if (convForAi?.type === "ai" && process.env.CONVEX_OPENAI_API_KEY && process.env.CONVEX_OPENAI_BASE_URL) {
      try {
        await ctx.scheduler.runAfter(1000, internal.menu.chat.messages.generateAIResponse, {
          conversationId: args.conversationId,
          userMessageId: messageId,
        });
      } catch (e) {
        console.warn("AI scheduling failed:", e);
      }
    }

    return messageId;
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Only the author can delete their message
    if (message.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.delete(args.messageId);
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Only the author can edit their message
    if (message.senderId !== userId) {
      throw new Error("Not authorized to edit this message");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
  },
});

// Mark messages as read up to a specific messageId (updates participant.lastReadAt)
export const markReadTo = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const msg = await ctx.db.get(args.messageId);
    if (!msg || String(msg.conversationId) !== String(args.conversationId)) {
      throw new Error("Message not found in conversation");
    }

    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!participation) return;

    const current = participation.lastReadAt || 0;
    const targetTs = (msg as any)._creationTime || Date.now();
    if (targetTs > current) {
      await ctx.db.patch(participation._id, { lastReadAt: targetTs });
    }
  },
});

// Add reaction to message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Check if user already reacted with this emoji
    const existingReaction = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user", (q) => 
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    // Toggle behavior: if exists -> remove; else -> insert
    if (existingReaction) {
      await ctx.db.delete(existingReaction._id);
    } else {
      await ctx.db.insert("messageReactions", {
        messageId: args.messageId,
        userId,
        emoji: args.emoji,
      });
    }
  },
});

// Remove reaction from message
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reaction = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user", (q) => 
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (!reaction) {
      throw new Error("Reaction not found");
    }

    await ctx.db.delete(reaction._id);
  },
});

// Search messages within a conversation
export const searchMessages = query({
  args: {
    conversationId: v.id("conversations"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const candidates = await resolveCandidateUserIds(ctx);
    let isParticipant = false;
    for (const idStr of candidates) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      if (p) { isParticipant = true; break; }
    }
    if (!isParticipant) throw new Error("Not authorized");

    const results = await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query).eq("conversationId", args.conversationId).eq("type", "text")
      )
      .take(args.limit || 20);

    const withSenders = await Promise.all(
      results.map(async (m) => ({
        ...m,
        author: m.senderId ? await ctx.db.get(m.senderId) : null,
        sender: m.senderId ? await ctx.db.get(m.senderId) : null,
      }))
    );
    return withSenders;
  },
});

// File upload helpers
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const urls = await Promise.all(
      args.storageIds.map(async (id) => {
        try { return await ctx.storage.getUrl(id as any); } catch { return null; }
      })
    );
    return urls;
  },
});

// Internal endpoints for optional AI reply pipeline
export const getConversationForAI = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getRecentMessagesForAI = internalQuery({
  args: { conversationId: v.id("conversations"), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .take(args.limit);
  },
});

export const sendAIMessage = internalMutation({
  args: { conversationId: v.id("conversations"), content: v.string(), aiModel: v.string() },
  handler: async (ctx, args) => {
    const firstParticipant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .first();
    if (!firstParticipant) throw new Error("No participants found");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: firstParticipant.userId,
      content: args.content,
      type: "text",
      metadata: { aiModel: args.aiModel },
    });

    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });
    return messageId;
  },
});

export const generateAIResponse = internalAction({
  args: { conversationId: v.id("conversations"), userMessageId: v.id("messages") },
  handler: async (ctx, args) => {
    const conversation = await ctx.runQuery(internal.menu.chat.messages.getConversationForAI, { conversationId: args.conversationId });
    if (!conversation || conversation.type !== "ai") return;

    const recent = await ctx.runQuery(internal.menu.chat.messages.getRecentMessagesForAI, { conversationId: args.conversationId, limit: 10 });

    // Build messages payload (very simple heuristic)
    const system = conversation.metadata?.systemPrompt ? conversation.metadata.systemPrompt + "\n\n" : "";
    const aiMessages = recent
      .slice()
      .reverse()
      .map((m: any, i: number) => ({
        role: m.metadata?.aiModel ? ("assistant" as const) : ("user" as const),
        content: (i === recent.length - 1 && system ? system : "") + (m.content || ""),
      }));

    if (!process.env.CONVEX_OPENAI_API_KEY || !process.env.CONVEX_OPENAI_BASE_URL) return;

    try {
      const resp = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: conversation.metadata?.aiModel || "gpt-4.1-nano",
          messages: aiMessages,
          max_tokens: 1000,
        }),
      });
      const data = await resp.json();
      const aiContent = data?.choices?.[0]?.message?.content;
      if (aiContent) {
        await ctx.runMutation(internal.menu.chat.messages.sendAIMessage, {
          conversationId: args.conversationId,
          content: aiContent,
          aiModel: conversation.metadata?.aiModel || "gpt-4.1-nano",
        });
      }
    } catch (err) {
      console.error("AI response generation failed", err);
      await ctx.runMutation(internal.menu.chat.messages.sendAIMessage, {
        conversationId: args.conversationId,
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        aiModel: "error",
      });
    }
  },
});
