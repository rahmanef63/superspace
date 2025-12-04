/**
 * AI Detail View (Refactored)
 * Uses shared/communications AI components
 */

"use client";

import React from "react";
import { useAIStore } from "@/frontend/features/ai/stores";
import { useAIActions } from "@/frontend/features/ai/hooks";
import { useAIKnowledgeContext } from "@/frontend/features/ai/hooks/useAIKnowledgeContext";
import {
  AIContainer,
  AIEmptyState,
  AIKnowledgeSelector,
  AIInput,
} from "@/frontend/shared/communications";
import type { 
  AIMessage as SharedAIMessage,
  AISession as SharedAISession,
  KnowledgeSourceType as SharedKnowledgeSourceType,
} from "@/frontend/shared/communications/chat/types/ai";

interface AIDetailViewProps {
  chatId?: string;
}

export function AIDetailViewRefactored({ chatId: externalChatId }: AIDetailViewProps) {
  // Use Zustand store
  const selectedSession = useAIStore((s) => s.selectedSession);
  const storeSelectedSessionId = useAIStore((s) => s.selectedSessionId);
  const isSending = useAIStore((s) => s.isSending);
  const isLoading = useAIStore((s) => s.isLoading);
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled);
  const setKnowledgeEnabled = useAIStore((s) => s.setKnowledgeEnabled);
  const selectedKnowledgeSources = useAIStore((s) => s.selectedKnowledgeSources);
  const setKnowledgeSources = useAIStore((s) => s.setKnowledgeSources);
  const { sendMessage, createSession, selectSession } = useAIActions();

  // Get knowledge context for AI
  const { knowledgeContext, hasKnowledge } = useAIKnowledgeContext();

  // Use external or store chatId
  const chatId = externalChatId ?? storeSelectedSessionId;

  // Transform messages to shared format
  const messages: SharedAIMessage[] = (selectedSession?.messages ?? []).map((msg) => ({
    id: msg.id,
    roomId: chatId || "",
    role: msg.role,
    author: {
      id: msg.role === "user" ? "user" : "assistant",
      name: msg.role === "user" ? "You" : "AI Assistant",
      isBot: msg.role === "assistant",
    },
    createdAt: msg.timestamp,
    content: {
      text: msg.content,
    },
    metadata: msg.metadata,
  }));

  // Transform session to shared format (type-safe cast)
  const sharedSession: SharedAISession | null = selectedSession ? {
    ...selectedSession,
    workspaceId: selectedSession.workspaceId as any,
    messages: messages,
  } : null;

  // Handle send message
  const handleSend = async (message: string) => {
    const contextToUse = knowledgeEnabled ? knowledgeContext : undefined;

    // If no session, create one first
    if (!chatId) {
      const session = await createSession(message.slice(0, 50));
      if (session) {
        selectSession(session._id);
        setTimeout(() => {
          sendMessage(message, contextToUse);
        }, 100);
      }
      return;
    }

    await sendMessage(message, contextToUse);
  };

  // Handle knowledge toggle
  const handleKnowledgeToggle = (enabled: boolean) => {
    setKnowledgeEnabled(enabled);
  };

  // Empty state - no conversation selected
  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <AIEmptyState
          variant="no-session"
          onSuggestionClick={(suggestion) => handleSend(suggestion)}
        />
        {/* Input at bottom for starting new chat */}
        <div className="p-4 border-t border-border bg-card">
          <div className="max-w-4xl mx-auto">
            <AIInputWithActions
              onSend={handleSend}
              isSending={isSending}
              knowledgeEnabled={knowledgeEnabled}
              onKnowledgeToggle={handleKnowledgeToggle}
              hasKnowledge={hasKnowledge}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AIContainer
      session={sharedSession}
      messages={messages}
      isLoading={isLoading && !selectedSession}
      isSending={isSending}
      knowledgeEnabled={knowledgeEnabled}
      hasKnowledge={hasKnowledge}
      onSend={handleSend}
      onKnowledgeToggle={handleKnowledgeToggle}
      toolbarSlot={
        <div className="px-4 py-2">
          <AIKnowledgeSelector
            isEnabled={knowledgeEnabled}
            onEnabledChange={setKnowledgeEnabled}
            selectedSources={selectedKnowledgeSources as SharedKnowledgeSourceType[]}
            onSourcesChange={setKnowledgeSources as (sources: SharedKnowledgeSourceType[]) => void}
          />
        </div>
      }
    />
  );
}

// Simple input wrapper for the empty state
function AIInputWithActions({
  onSend,
  isSending,
  knowledgeEnabled,
  onKnowledgeToggle,
  hasKnowledge,
}: {
  onSend: (message: string) => void;
  isSending: boolean;
  knowledgeEnabled: boolean;
  onKnowledgeToggle: (enabled: boolean) => void;
  hasKnowledge: boolean;
}) {
  return (
    <AIInput
      onSend={onSend}
      isSending={isSending}
      placeholder="Start a new conversation..."
      knowledgeEnabled={knowledgeEnabled}
      onKnowledgeToggle={onKnowledgeToggle}
      hasKnowledge={hasKnowledge}
    />
  );
}

export default AIDetailViewRefactored;
