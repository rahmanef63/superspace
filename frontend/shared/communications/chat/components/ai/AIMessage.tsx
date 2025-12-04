/**
 * AI Message Component
 * Renders AI chat messages with streaming support
 * @module shared/communications/chat/components/ai/AIMessage
 */

"use client";

import React from "react";
import { Bot, User, Copy, RefreshCw, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AIMessage as AIMessageType, AIBotType } from "../../types/ai";

export interface AIMessageProps {
  message: AIMessageType;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * Individual AI message component
 */
export function AIMessage({
  message,
  isStreaming = false,
  onCopy,
  onRegenerate,
  showActions = true,
  className,
}: AIMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const content = isStreaming && message.streamContent 
    ? message.streamContent 
    : message.content.text || "";

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(content);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && message.role === "assistant") {
      onRegenerate(message.id);
    }
  };

  // System messages are displayed differently
  if (isSystem) {
    return (
      <div className={cn("text-center py-2", className)}>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Avatar for AI */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
        {/* Message bubble */}
        <Card
          className={cn(
            "p-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          <div className="whitespace-pre-wrap break-words">{content}</div>
          
          {/* Streaming indicator */}
          {isStreaming && (
            <span className="inline-flex items-center gap-1 mt-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs opacity-70">Thinking...</span>
            </span>
          )}
        </Card>

        {/* Message metadata & actions */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Token count */}
          {message.metadata?.tokenCount && !isUser && (
            <span className="text-muted-foreground/60">
              {message.metadata.tokenCount} tokens
            </span>
          )}

          {/* Actions */}
          {showActions && !isStreaming && (
            <div
              className={cn(
                "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              {!isUser && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRegenerate}
                  title="Regenerate response"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar for User */}
      {isUser && (
        <div className="flex-shrink-0">
          {message.author.avatarUrl ? (
            <img
              src={message.author.avatarUrl}
              alt={message.author.name || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIMessage;
