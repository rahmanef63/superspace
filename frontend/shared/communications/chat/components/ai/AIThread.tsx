/**
 * AI Thread Component
 * Message thread for AI conversations
 * @module shared/communications/chat/components/ai/AIThread
 */

"use client";

import React, { useRef, useEffect } from "react";
import { Loader2, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIMessage } from "./AIMessage";
import type { AIMessage as AIMessageType, AIConfig } from "../../types/ai";

export interface AIThreadProps {
  messages: AIMessageType[];
  isLoading?: boolean;
  isSending?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  config?: AIConfig;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * AI message thread component
 */
export function AIThread({
  messages,
  isLoading = false,
  isSending = false,
  onCopy,
  onRegenerate,
  config,
  emptyState,
  className,
}: AIThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-4", className)}>
        {emptyState || (
          <div className="text-center max-w-md">
            <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              Start the conversation
            </h3>
            <p className="text-sm text-muted-foreground">
              Type a message below to begin chatting with AI.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1", className)} ref={scrollRef}>
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <AIMessage
            key={message.id}
            message={message}
            isStreaming={message.isStreaming}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            showActions={index === messages.length - 1 || message.role === "assistant"}
          />
        ))}

        {/* Typing indicator when AI is processing */}
        {isSending && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-muted rounded-lg rounded-bl-sm p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

export default AIThread;
