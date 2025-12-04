/**
 * AI Container Component
 * Main container for AI chat interface
 * Uses shared layout container from frontend/shared/ui/layout/container
 * @module shared/communications/chat/components/ai/AIContainer
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { ContainerHeader } from "@/frontend/shared/ui/layout/header";
import { Bot } from "lucide-react";
import { AIHeader } from "./AIHeader";
import { AIThread } from "./AIThread";
import { AIInput } from "./AIInput";
import type {
  AISession,
  AIMessage,
  AIConfig,
  AILayout,
  AIEvents,
  AIBotConfig,
  AIKnowledgeContext,
} from "../../types/ai";

export interface AIContainerProps {
  session: AISession | null;
  messages: AIMessage[];
  bot?: AIBotConfig;
  config?: AIConfig;
  layout?: AILayout;
  events?: AIEvents;
  isLoading?: boolean;
  isSending?: boolean;
  knowledgeEnabled?: boolean;
  hasKnowledge?: boolean;
  onSend: (message: string) => void;
  onKnowledgeToggle?: (enabled: boolean) => void;
  onRegenerate?: (messageId: string) => void;
  onBack?: () => void;
  onSettings?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  className?: string;
  children?: React.ReactNode;
  /** Use shared ContainerHeader instead of AIHeader */
  useSharedHeader?: boolean;
  /** Toolbar slot (for knowledge selector, etc.) */
  toolbarSlot?: React.ReactNode;
}

/**
 * Main AI chat container component
 * Uses shared PageContainer for consistent layout
 */
export function AIContainer({
  session,
  messages,
  bot,
  config,
  layout,
  events,
  isLoading = false,
  isSending = false,
  knowledgeEnabled = false,
  hasKnowledge = false,
  onSend,
  onKnowledgeToggle,
  onRegenerate,
  onBack,
  onSettings,
  onArchive,
  onDelete,
  className,
  children,
  useSharedHeader = false,
  toolbarSlot,
}: AIContainerProps) {
  const handleSend = (message: string) => {
    onSend(message);
    events?.onMessageSend?.({ text: message });
  };

  const handleCopy = (content: string) => {
    // Could emit event for analytics
  };

  const handleCommand = (command: string, args: string[]) => {
    events?.onCommand?.(command, args);
  };

  return (
    <PageContainer
      maxWidth="full"
      padding={false}
      fullHeight
      className={cn("flex flex-col", className)}
    >
      {/* Header - Use shared or custom */}
      {useSharedHeader ? (
        <ContainerHeader
          title={session?.title || bot?.name || "AI Assistant"}
          subtitle={`${messages.length} message${messages.length !== 1 ? "s" : ""}`}
          icon={Bot}
          showBack={!!onBack}
          onBack={onBack}
        />
      ) : (
        <AIHeader
          session={session}
          bot={bot}
          messageCount={messages.length}
          onBack={onBack}
          onSettings={onSettings}
          onArchive={onArchive}
          onDelete={onDelete}
          showBackButton={!!onBack}
        />
      )}

      {/* Toolbar slot (for knowledge selector, etc.) */}
      {toolbarSlot && (
        <div className="border-b border-border bg-background/50">
          {toolbarSlot}
        </div>
      )}

      {/* Custom children (e.g., knowledge selector) */}
      {children}

      {/* Message Thread */}
      <AIThread
        messages={messages}
        isLoading={isLoading}
        isSending={isSending}
        onCopy={handleCopy}
        onRegenerate={onRegenerate}
        config={config}
      />

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto">
          <AIInput
            onSend={handleSend}
            onCommand={handleCommand}
            onKnowledgeToggle={onKnowledgeToggle}
            config={config}
            isSending={isSending}
            placeholder={
              knowledgeEnabled && hasKnowledge
                ? "Ask about your workspace knowledge..."
                : "Ask AI anything..."
            }
            knowledgeEnabled={knowledgeEnabled}
            hasKnowledge={hasKnowledge}
          />
        </div>
      </div>
    </PageContainer>
  );
}

export default AIContainer;
