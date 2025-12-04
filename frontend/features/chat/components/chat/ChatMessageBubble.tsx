/**
 * Chat Message Component (Refactored)
 * Uses shared/communications components
 */

"use client";

import React from "react";
import { Check, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Message, UserMeta, Attachment } from "@/frontend/shared/communications";

export interface ChatMessageBubbleProps {
  message: Message;
  currentUser?: UserMeta;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

type MessageStatus = "sending" | "sent" | "delivered" | "read";

/**
 * Chat message bubble using shared types
 */
export function ChatMessageBubble({
  message,
  currentUser,
  showAvatar = true,
  showTimestamp = true,
  className,
}: ChatMessageBubbleProps) {
  const isOwn = currentUser ? message.author.id === currentUser.id : false;
  const isSystem = message.isSystem;

  // Determine status from message
  // Using readBy to determine if read, else check if id exists (sent)
  // We cast to MessageStatus to allow all possible states in the UI
  const getStatus = (): MessageStatus => {
    if (message.readBy && message.readBy.length > 0) return "read";
    if (message.id) return "sent";
    return "sending";
  };
  const status = getStatus();

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // System message
  if (isSystem) {
    return (
      <div className={cn("flex justify-center my-2", className)}>
        <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {message.content.text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex mb-4",
        isOwn ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          {message.author.avatarUrl ? (
            <img
              src={message.author.avatarUrl}
              alt={message.author.name || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {(message.author.name || "?")[0].toUpperCase()}
            </div>
          )}
        </div>
      )}

      <Card
        className={cn(
          "max-w-[80%] p-3 shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}
      >
        {/* Author name for group chats */}
        {!isOwn && message.author.name && (
          <div className="text-xs font-medium mb-1 opacity-70">
            {message.author.name}
          </div>
        )}

        {/* Message text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content.text}
        </p>

        {/* Attachments */}
        {message.content.attachments && message.content.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.content.attachments.map((att: Attachment) => (
              <div key={att.id} className="rounded overflow-hidden">
                {att.kind === "image" ? (
                  <img
                    src={att.url}
                    alt={att.name || "Image"}
                    className="max-w-full rounded"
                  />
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    {att.name || "File"}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        {showTimestamp && (
          <div
            className={cn(
              "flex items-center justify-end gap-1 mt-1 text-xs",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && (
              <div className="flex items-center">
                {status === "sending" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : status === "read" ? (
                  <CheckCheck className="h-3 w-3 text-blue-400" />
                ) : status === "delivered" ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default ChatMessageBubble;
