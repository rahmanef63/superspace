import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requirePermission, ensureUser, requireActiveMembership } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

/**
 * Update AI settings for a workspace
 */
export const updateSettings = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.string(),
    apiKey: v.string(),
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
    systemPrompt: v.optional(v.string()),
    rateLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // STEP 1: Permission check
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMISSIONS.MANAGE_WORKSPACE);

    // STEP 2: Workspace verification
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // STEP 3: Business logic
    const existing = await ctx.db
      .query("aiSettings")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .unique();

    let settingsId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      settingsId = existing._id;
    } else {
      settingsId = await ctx.db.insert("aiSettings", {
        ...args,
        status: "active",
        updatedAt: Date.now(),
      });
    }

    // STEP 4: Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "aiSettings.updated",
      resourceType: "aiSettings",
      resourceId: settingsId,
      metadata: { provider: args.provider, model: args.model },
    });

    return settingsId;
  },
});

/**
 * Create a new chat session
 */
export const createChatSession = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")), // Optional for global sessions
    userId: v.id("users"),
    title: v.string(),
    isGlobal: v.optional(v.boolean()), // true for global/private sessions
  },
  handler: async (ctx, args) => {
    // STEP 1: Permission check (only for workspace sessions)
    const currentUserId = await ensureUser(ctx);
    if (args.workspaceId && !args.isGlobal) {
      await requirePermission(ctx, args.workspaceId, PERMISSIONS.DOCUMENTS_CREATE);

      // STEP 2: Workspace verification
      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }
    }

    // STEP 3: User verification
    if (args.userId !== currentUserId) {
      throw new Error("Cannot create session for another user");
    }

    // STEP 4: Business logic
    const now = Date.now();
    const sessionId = await ctx.db.insert("aiChatSessions", {
      workspaceId: args.isGlobal ? undefined : args.workspaceId,
      userId: args.userId,
      title: args.title,
      isGlobal: args.isGlobal ?? false,
      messages: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // STEP 5: Audit log (only for workspace sessions)
    if (args.workspaceId && !args.isGlobal) {
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: currentUserId,
        action: "aiChatSession.created",
        resourceType: "aiChatSessions",
        resourceId: sessionId,
        metadata: { title: args.title, isGlobal: false },
      });
    }

    return await ctx.db.get(sessionId);
  },
});

/**
 * Create or update a knowledge base document
 */
export const upsertKbDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
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
    // STEP 1: Permission check
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMISSIONS.DOCUMENTS_CREATE);

    // STEP 2: Workspace verification
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // STEP 3: Business logic
    const existing = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_source", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
          .eq("sourceType", args.sourceType)
          .eq("sourceId", args.sourceId)
      )
      .unique();

    let documentId;
    const isUpdate = !!existing;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      documentId = existing._id;
    } else {
      documentId = await ctx.db.insert("knowledgeBaseDocuments", {
        ...args,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // STEP 4: Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: isUpdate ? "knowledgeBaseDocument.updated" : "knowledgeBaseDocument.created",
      resourceType: "knowledgeBaseDocuments",
      resourceId: documentId,
      metadata: { title: args.title, sourceType: args.sourceType },
    });

    return documentId;
  },
});

/**
 * Delete a knowledge base document
 */
export const deleteKbDocument = mutation({
  args: {
    documentId: v.id("knowledgeBaseDocuments"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // STEP 1: Permission check
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMISSIONS.DOCUMENTS_DELETE);

    // STEP 2: Verify document exists and belongs to workspace
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.workspaceId !== args.workspaceId) {
      throw new Error("Document does not belong to this workspace");
    }

    // STEP 3: Business logic
    await ctx.db.delete(args.documentId);

    // STEP 4: Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "knowledgeBaseDocument.deleted",
      resourceType: "knowledgeBaseDocuments",
      resourceId: args.documentId,
      metadata: { title: document.title },
    });

    return true;
  },
});

/**
 * Record AI usage statistics
 */
export const recordUsage = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.string(),
    model: v.string(),
    requestCount: v.number(),
    tokenCount: v.number(),
    cost: v.number(),
    errors: v.number(),
  },
  handler: async (ctx, args) => {
    // STEP 1: Permission check (usage recording is typically internal, but verify workspace access)
    await requireActiveMembership(ctx, args.workspaceId);
    const userId = await ensureUser(ctx);

    // STEP 2: Workspace verification
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }


    // STEP 3: Business logic
    const date = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("aiUsageStats")
      .withIndex("by_workspace_date", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
          .eq("date", date)
      )
      .unique();

    let statsId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        requestCount: existing.requestCount + args.requestCount,
        tokenCount: existing.tokenCount + args.tokenCount,
        cost: existing.cost + args.cost,
        errors: existing.errors + args.errors,
      });
      statsId = existing._id;
    } else {
      statsId = await ctx.db.insert("aiUsageStats", {
        ...args,
        date,
      });
    }

    // STEP 4: Audit log (usage tracking)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "aiUsageStats.recorded",
      resourceType: "aiUsageStats",
      resourceId: statsId,
      metadata: {
        provider: args.provider,
        model: args.model,
        requestCount: args.requestCount,
        tokenCount: args.tokenCount,
      },
    });

    return statsId;
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
    id: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      url: v.string(),
      size: v.number(),
    }))),
    replyTo: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    metadata: v.optional(v.object({
      tokenCount: v.optional(v.float64()),
      contextIds: v.optional(v.array(v.string())),
      duration: v.optional(v.float64()),
    })),
  },
  handler: async (ctx, args) => {
    // STEP 1: Get session and verify access
    const userId = await ensureUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    // STEP 2: Permission check (only for workspace sessions)
    if (session.workspaceId) {
      // Handle workspaceId as string or Id
      const workspaceId = typeof session.workspaceId === 'string'
        ? (ctx.db.normalizeId?.('workspaces', session.workspaceId) as any)
        : session.workspaceId;
      if (workspaceId) {
        await requirePermission(ctx, workspaceId, PERMISSIONS.DOCUMENTS_CREATE);
      }
    } else if (session.userId !== userId) {
      // For global sessions, verify user owns the session
      throw new Error("Cannot modify another user's session");
    }

    // STEP 3: Business logic
    const messageEntry = {
      id: args.id ?? Math.random().toString(36).substring(2, 15),
      role: args.role,
      content: args.message,
      timestamp: Date.now(),
      attachments: args.attachments,
      replyTo: args.replyTo,
      reasoning: args.reasoning,
      metadata: args.metadata,
    };

    await ctx.db.patch(args.sessionId, {
      messages: [...session.messages, messageEntry] as any,
      updatedAt: Date.now(),
    });

    // STEP 4: Audit log (only for workspace sessions)
    if (session.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: session.workspaceId,
        actorUserId: userId,
        action: "aiChatMessage.appended",
        resourceType: "aiChatSessions",
        resourceId: args.sessionId,
        metadata: {
          messageId: messageEntry.id,
          role: args.role,
          hasAttachments: !!args.attachments?.length,
        },
      });
    }

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
    // STEP 1: Get session and verify access
    const userId = await ensureUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    // STEP 2: Permission check (only for workspace sessions)
    if (session.workspaceId) {
      // Handle workspaceId as string or Id
      const workspaceId = typeof session.workspaceId === 'string'
        ? (ctx.db.normalizeId?.('workspaces', session.workspaceId) as any)
        : session.workspaceId;
      if (workspaceId) {
        await requirePermission(ctx, workspaceId, PERMISSIONS.DOCUMENTS_EDIT);
      }
    } else if (session.userId !== userId) {
      // For global sessions, verify user owns the session
      throw new Error("Cannot modify another user's session");
    }

    // STEP 3: Business logic
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

    // STEP 4: Audit log (only for workspace sessions)
    if (session.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: session.workspaceId,
        actorUserId: userId,
        action: "aiChatSession.updated",
        resourceType: "aiChatSessions",
        resourceId: args.sessionId,
        metadata: {
          titleChanged: args.title !== undefined,
          statusChanged: args.status !== undefined,
        },
      });
    }

    return await ctx.db.get(args.sessionId);
  },
});

/**
 * Delete a chat session
 */
export const deleteChatSession = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
  },
  handler: async (ctx, args) => {
    // STEP 1: Get session and verify access
    const userId = await ensureUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    // STEP 2: Permission check (only for workspace sessions)
    if (session.workspaceId) {
      const workspaceId = typeof session.workspaceId === 'string'
        ? ctx.db.normalizeId?.('workspaces', session.workspaceId) ?? args.sessionId as any
        : session.workspaceId;
      if (workspaceId) {
        await requirePermission(ctx, workspaceId, PERMISSIONS.DOCUMENTS_DELETE);
      }
    } else if (session.userId !== userId) {
      // For global sessions, verify user owns the session
      throw new Error("Cannot delete another user's session");
    }

    // STEP 3: Business logic
    await ctx.db.delete(args.sessionId);

    // STEP 4: Audit log (only for workspace sessions)
    if (session.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: session.workspaceId,
        actorUserId: userId,
        action: "aiChatSession.deleted",
        resourceType: "aiChatSessions",
        resourceId: args.sessionId,
        metadata: { title: session.title },
      });
    }

    return { success: true, id: args.sessionId };
  },
});

/**
 * Add a branch to a message (for regeneration)
 */
export const addMessageBranch = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    messageId: v.string(),
    content: v.string(),
    branchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // STEP 1: Get session and verify access
    const userId = await ensureUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    // STEP 2: Permission check (only for workspace sessions)
    if (session.workspaceId) {
      // Handle workspaceId as string or Id
      const workspaceId = typeof session.workspaceId === 'string'
        ? (ctx.db.normalizeId?.('workspaces', session.workspaceId) as any)
        : session.workspaceId;
      if (workspaceId) {
        await requirePermission(ctx, workspaceId, PERMISSIONS.DOCUMENTS_EDIT);
      }
    } else if (session.userId !== userId) {
      throw new Error("Cannot modify another user's session");
    }

    // STEP 3: Business logic
    const messages = session.messages.map((msg: any) => {
      if (msg.id === args.messageId) {
        const newBranch = {
          id: args.branchId ?? Math.random().toString(36).substring(2, 15),
          content: args.content,
          timestamp: Date.now(),
        };
        return {
          ...msg,
          branches: [...(msg.branches || []), newBranch],
        };
      }
      return msg;
    });

    await ctx.db.patch(args.sessionId, {
      messages,
      updatedAt: Date.now(),
    });

    // STEP 4: Audit log (only for workspace sessions)
    if (session.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: session.workspaceId,
        actorUserId: userId,
        action: "aiChatMessage.branch_added",
        resourceType: "aiChatSessions",
        resourceId: args.sessionId,
        metadata: { messageId: args.messageId },
      });
    }

    return messages.find((m: any) => m.id === args.messageId);
  },
});

/**
 * Set feedback for a message
 */
export const setMessageFeedback = mutation({
  args: {
    sessionId: v.id("aiChatSessions"),
    messageId: v.string(),
    feedback: v.string(), // "up" | "down"
  },
  handler: async (ctx, args) => {
    // STEP 1: Get session and verify access
    const userId = await ensureUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    // STEP 2: Permission check (only for workspace sessions)
    if (session.workspaceId) {
      // Handle workspaceId as string or Id
      const workspaceId = typeof session.workspaceId === 'string'
        ? (ctx.db.normalizeId?.('workspaces', session.workspaceId) as any)
        : session.workspaceId;
      if (workspaceId) {
        await requirePermission(ctx, workspaceId, PERMISSIONS.DOCUMENTS_EDIT);
      }
    } else if (session.userId !== userId) {
      throw new Error("Cannot modify another user's session");
    }

    // STEP 3: Business logic
    const messages = session.messages.map((msg: any) => {
      if (msg.id === args.messageId) {
        return {
          ...msg,
          feedback: args.feedback,
        };
      }
      return msg;
    });

    await ctx.db.patch(args.sessionId, {
      messages,
      updatedAt: Date.now(),
    });

    // STEP 4: Audit log (only for workspace sessions)
    if (session.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: session.workspaceId,
        actorUserId: userId,
        action: "aiChatMessage.feedback_set",
        resourceType: "aiChatSessions",
        resourceId: args.sessionId,
        metadata: { messageId: args.messageId, feedback: args.feedback },
      });
    }
  },
});
