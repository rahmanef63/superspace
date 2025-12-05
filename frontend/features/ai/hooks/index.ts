"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useUser } from "@clerk/nextjs"
import type { AIConversation, AIMessageData, AISettings } from "../types"
import { generateId, generateConversationTitle, extractTopicFromMessage } from "../utils"
import { DEFAULT_AI_SETTINGS } from "../constants"
import { useAIStore, type AISession, type AIMessage } from "../stores"
import { useAISettingsStorage, type AIApiKeyConfig } from "../settings/useAISettings"
import { toast } from "sonner"

// ============================================================================
// Initialize AI Hook (like useInitializeChat)
// ============================================================================

export const useInitializeAI = (providedWorkspaceId?: Id<"workspaces"> | null) => {
  const { workspaceId: contextWorkspaceId } = useWorkspaceContext();
  const { user } = useUser();
  const init = useAIStore((s) => s.init);
  const setSessions = useAIStore((s) => s.setSessions);
  const setLoading = useAIStore((s) => s.setLoading);
  const globalMode = useAIStore((s) => s.globalMode);

  const effectiveWorkspaceId = (providedWorkspaceId ?? (contextWorkspaceId as Id<"workspaces"> | null)) || null;
  const userId = user?.id || null;

  const initializedRef = useRef<string | null>(null);

  // Query sessions from Convex - respects global mode
  const sessions = useQuery(
    api.features.ai.queries.listChatSessions,
    userId
      ? {
          workspaceId: globalMode ? undefined : effectiveWorkspaceId ?? undefined,
          userId,
          status: "active",
          global: globalMode,
        }
      : "skip"
  );

  useEffect(() => {
    if (!effectiveWorkspaceId || !userId) return;
    
    const key = `${effectiveWorkspaceId}-${userId}`;
    if (initializedRef.current === key) return;

    init(effectiveWorkspaceId, userId);
    initializedRef.current = key;
  }, [effectiveWorkspaceId, userId, init]);

  // Sync sessions from Convex to store
  useEffect(() => {
    if (sessions === undefined) {
      setLoading(true);
      return;
    }
    
    // Transform Convex sessions to store format
    const transformedSessions: AISession[] = sessions.map((s: any) => ({
      _id: s._id,
      id: s._id, // Alias for ConversationItem compatibility
      workspaceId: s.workspaceId,
      userId: s.userId,
      title: s.title,
      isGlobal: s.isGlobal,
      messages: s.messages.map((m: any, idx: number) => ({
        id: `${s._id}-${idx}`,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.timestamp,
        metadata: m.metadata,
      })),
      status: s.status as 'active' | 'archived',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
    
    setSessions(transformedSessions);
    setLoading(false);
  }, [sessions, setSessions, setLoading]);

  return { workspaceId: effectiveWorkspaceId, userId, globalMode };
};

// ============================================================================
// AI Actions Hook (create session, send message)
// ============================================================================

export const useAIActions = () => {
  const workspaceId = useAIStore((s) => s.workspaceId);
  const userId = useAIStore((s) => s.userId);
  const globalMode = useAIStore((s) => s.globalMode);
  const sessions = useAIStore((s) => s.sessions);
  const selectedSessionId = useAIStore((s) => s.selectedSessionId);
  const selectedSession = useAIStore((s) => s.selectedSession);
  const selectedKnowledgeSources = useAIStore((s) => s.selectedKnowledgeSources);
  const addSession = useAIStore((s) => s.addSession);
  const addMessage = useAIStore((s) => s.addMessage);
  const updateSession = useAIStore((s) => s.updateSession);
  const setSelectedSession = useAIStore((s) => s.setSelectedSession);
  const setSending = useAIStore((s) => s.setSending);
  const setError = useAIStore((s) => s.setError);

  // Get AI settings for API key and model
  const { settings } = useAISettingsStorage();

  const createSessionMutation = useMutation(api.features.ai.mutations.createChatSession);
  const appendMessageMutation = useMutation(api.features.ai.mutations.appendChatMessage);
  const updateSessionMutation = useMutation(api.features.ai.mutations.updateChatSession);
  const addMessageBranchMutation = useMutation(api.features.ai.mutations.addMessageBranch);
  const setMessageFeedbackMutation = useMutation(api.features.ai.mutations.setMessageFeedback);

  // Generate title using AI based on conversation
  const generateTitle = useCallback(async (
    userMessage: string,
    aiResponse: string,
    provider: string,
    model: string,
    apiKey: string,
    baseUrl?: string
  ) => {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Generate a very short title (3-6 words max) that summarizes this conversation topic. Return ONLY the title, no quotes, no punctuation at the end, no explanation."
            },
            { role: "user", content: userMessage },
            { role: "assistant", content: aiResponse.slice(0, 500) }, // Limit for context
            { role: "user", content: "Generate a short title for this conversation:" }
          ],
          provider,
          model,
          apiKey,
          baseUrl,
          temperature: 0.3,
          maxTokens: 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Clean up the title - remove quotes and extra whitespace
        const title = data.content?.trim().replace(/^["']|["']$/g, '').slice(0, 50);
        return title || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to generate title:", error);
      return null;
    }
  }, []);

  const createSession = useCallback(async (title?: string) => {
    if (!userId) {
      console.error("Cannot create session: userId missing");
      return null;
    }

    // For workspace mode, workspaceId is required
    if (!globalMode && !workspaceId) {
      console.error("Cannot create workspace session: workspaceId missing");
      return null;
    }

    try {
      const session = await createSessionMutation({
        workspaceId: globalMode ? undefined : workspaceId ?? undefined,
        userId,
        title: title || "New Chat",
        isGlobal: globalMode,
      });

      if (session) {
        const newSession: AISession = {
          _id: session._id,
          id: session._id, // Alias for ConversationItem compatibility
          workspaceId: session.workspaceId,
          userId: session.userId,
          title: session.title,
          isGlobal: session.isGlobal,
          messages: [],
          status: session.status as 'active' | 'archived',
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        };
        addSession(newSession);
        return session;
      }
      return null;
    } catch (error) {
      console.error("Failed to create session:", error);
      return null;
    }
  }, [workspaceId, userId, globalMode, createSessionMutation, addSession]);

  const sendMessage = useCallback(async (
    content: string, 
    knowledgeContext?: string, 
    sessionIdOverride?: Id<"aiChatSessions">,
    options?: {
      attachments?: any[],
      replyTo?: string,
    }
  ) => {
    // Allow passing sessionId directly for immediate use after session creation
    const targetSessionId: Id<"aiChatSessions"> | null = sessionIdOverride ?? selectedSessionId;
    
    if (!targetSessionId) {
      console.error("No session selected");
      return null;
    }

    // TypeScript now knows targetSessionId is Id<"aiChatSessions">
    const sessionId = targetSessionId;

    // Get the target session from store
    const targetSession = sessionIdOverride 
      ? sessions.find((s: AISession) => s._id === sessionIdOverride)
      : selectedSession;

    // Get the API key for the configured provider
    const provider = settings.defaultProvider || "groq";
    const model = settings.defaultModel || "llama-3.3-70b-versatile";
    const apiKeyConfig = settings.apiKeys?.find(
      (k: AIApiKeyConfig) => k.providerId === provider && k.isEnabled
    );

    if (!apiKeyConfig?.apiKey && provider !== "ollama") {
      toast.error(`No API key configured for ${provider}. Go to Settings > AI to add one.`);
      return null;
    }

    setSending(true);
    setError(null);

    // Check if this is the first message (for auto-title generation)
    const isFirstMessage = !targetSession?.messages?.length || targetSession.messages.length === 0;

    try {
      // Add user message to store immediately for optimistic UI
      const userMessageId = `${sessionId}-${Date.now()}`;
      addMessage(sessionId, {
        id: userMessageId,
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments: options?.attachments,
        replyTo: options?.replyTo,
      });

      // Persist user message to Convex
      await appendMessageMutation({
        sessionId,
        message: content,
        role: "user",
        id: userMessageId,
        attachments: options?.attachments,
        replyTo: options?.replyTo,
      });

      // Build system prompt with knowledge context
      const systemMessages: { role: 'system'; content: string }[] = [];
      
      if (knowledgeContext && !globalMode) {
        systemMessages.push({
          role: 'system',
          content: `You have access to the following knowledge from this workspace. Use this information to provide accurate, context-aware responses:\n\n${knowledgeContext}\n\nWhen answering questions, reference this knowledge when relevant. If the user asks about something not covered in the knowledge base, acknowledge that and provide general assistance.`,
        });
      }

      // Build messages array for API (include conversation history)
      const messages = [
        ...systemMessages,
        ...(targetSession?.messages || []).map((m: AIMessage) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      // Call AI API
      const startTime = Date.now();
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          provider,
          model,
          apiKey: apiKeyConfig?.apiKey || "",
          baseUrl: apiKeyConfig?.baseUrl,
          temperature: settings.temperature || 0.7,
          maxTokens: parseInt(settings.maxTokens || "2048"),
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.content;

      // Add AI response to store
      addMessage(sessionId, {
        id: `${sessionId}-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        metadata: {
          model: data.model,
          tokenCount: data.usage?.total_tokens,
          duration,
        },
      });

      // Persist AI response to Convex
      await appendMessageMutation({
        sessionId,
        message: aiResponse,
        role: "assistant",
        metadata: {
          tokenCount: data.usage?.total_tokens,
          duration,
        },
      });

      // Auto-generate title after first message exchange for new chats
      if (isFirstMessage && targetSession?.title === "New Chat") {
        const generatedTitle = await generateTitle(
          content,
          aiResponse,
          provider,
          model,
          apiKeyConfig?.apiKey || "",
          apiKeyConfig?.baseUrl
        );

        if (generatedTitle) {
          // Update in Convex
          await updateSessionMutation({
            sessionId,
            title: generatedTitle,
          });

          // Update in local store
          updateSession(sessionId, { title: generatedTitle });
        }
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      console.error("AI chat error:", error);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setSending(false);
    }
  }, [selectedSessionId, selectedSession, sessions, settings, appendMessageMutation, addMessage, setSending, setError, generateTitle, updateSessionMutation, updateSession, globalMode]);

  const regenerateMessage = useCallback(async (
    sessionId: Id<"aiChatSessions">,
    messageId: string,
    newContent: string
  ) => {
    try {
      await addMessageBranchMutation({
        sessionId,
        messageId,
        content: newContent,
      });
      return true;
    } catch (error) {
      console.error("Failed to add message branch:", error);
      return false;
    }
  }, [addMessageBranchMutation]);

  const submitFeedback = useCallback(async (
    sessionId: Id<"aiChatSessions">,
    messageId: string,
    feedback: "up" | "down"
  ) => {
    try {
      await setMessageFeedbackMutation({
        sessionId,
        messageId,
        feedback,
      });
      return true;
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      return false;
    }
  }, [setMessageFeedbackMutation]);

  const updateSessionMetadata = useCallback(async (
    sessionId: Id<"aiChatSessions">,
    updates: { icon?: string; title?: string; topic?: string }
  ) => {
    try {
      await updateSessionMutation({
        sessionId,
        ...updates,
      });
      updateSession(sessionId, updates);
      return true;
    } catch (error) {
      console.error("Failed to update session metadata:", error);
      return false;
    }
  }, [updateSessionMutation, updateSession]);

  return {
    createSession,
    sendMessage,
    regenerateMessage,
    submitFeedback,
    updateSessionMetadata,
    selectSession: setSelectedSession,
  };
};

// ============================================================================
// Legacy hooks (kept for backward compatibility)
// ============================================================================

export const useAIConversations = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const createNewConversation = useCallback((firstMessage?: string): string => {
    const id = generateId()
    const title = firstMessage ? generateConversationTitle(firstMessage) : "New Conversation"
    const topic = firstMessage ? extractTopicFromMessage(firstMessage) : "General"

    const newConversation: AIConversation = {
      id,
      title,
      topic,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: DEFAULT_AI_SETTINGS,
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedChatId(id)

    return id
  }, [])

  const addMessage = useCallback((conversationId: string, message: AIMessageData) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : conv,
      ),
    )
  }, [])

  const updateConversation = useCallback((conversationId: string, updates: Partial<AIConversation>) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates, updatedAt: new Date().toISOString() } : conv,
      ),
    )
  }, [])

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      if (selectedChatId === conversationId) {
        setSelectedChatId(undefined)
      }
    },
    [selectedChatId],
  )

  const selectedConversation = conversations.find((conv) => conv.id === selectedChatId)

  return {
    conversations,
    selectedChatId,
    selectedConversation,
    isLoading,
    setSelectedChatId,
    setIsLoading,
    createNewConversation,
    addMessage,
    updateConversation,
    deleteConversation,
  }
}

export const useAIChat = (conversationId?: string) => {
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string, onAddMessage: (message: AIMessageData) => void, settings?: AISettings) => {
      if (!conversationId) return

      setIsTyping(true)
      setError(null)

      // Add user message
      const userMessage: AIMessageData = {
        id: generateId(),
        text: message,
        sender: "user",
        timestamp: new Date().toISOString(),
        type: "text",
      }

      onAddMessage(userMessage)

      try {
        // Simulate AI response (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        const aiMessage: AIMessageData = {
          id: generateId(),
          text: `This is a simulated AI response to: "${message}". In a real implementation, this would be replaced with actual AI API calls.`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        }

        onAddMessage(aiMessage)
      } catch (err) {
        setError("Failed to get AI response. Please try again.")
        console.error("AI chat error:", err)
      } finally {
        setIsTyping(false)
      }
    },
    [conversationId],
  )

  return {
    sendMessage,
    isTyping,
    error,
    clearError: () => setError(null),
  }
}

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)

  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AI_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
