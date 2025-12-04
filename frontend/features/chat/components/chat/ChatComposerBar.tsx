/**
 * Chat Composer (Refactored)
 * Uses shared/communications patterns
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Paperclip, Mic, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatComposerBarProps {
  onSend: (message: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
  isSending?: boolean;
  showAttachments?: boolean;
  showEmoji?: boolean;
  showVoice?: boolean;
  className?: string;
}

/**
 * Chat composer bar component
 */
export function ChatComposerBar({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  disabledReason,
  isSending = false,
  showAttachments = true,
  showEmoji = true,
  showVoice = true,
  className,
}: ChatComposerBarProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (disabled || isSending || !message.trim()) return;

    const text = message.trim();
    setMessage("");
    await onSend(text);
    textareaRef.current?.focus();
  }, [message, disabled, isSending, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const effectiveDisabled = disabled || isSending;
  const effectivePlaceholder = disabled
    ? disabledReason || "You don't have permission to send messages"
    : placeholder;

  return (
    <div
      className={cn(
        "flex items-end gap-2 p-4 border-t border-border bg-card",
        className
      )}
    >
      {/* Attachment button */}
      {showAttachments && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground flex-shrink-0"
          disabled={effectiveDisabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      )}

      {/* Message input */}
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={effectivePlaceholder}
          disabled={effectiveDisabled}
          className="min-h-[40px] max-h-[120px] resize-none bg-background border-border"
          rows={1}
        />
      </div>

      {/* Emoji button */}
      {showEmoji && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground flex-shrink-0"
              disabled={effectiveDisabled}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="text-sm text-muted-foreground text-center py-4">
              Emoji picker coming soon
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Send/Voice button */}
      {message.trim() ? (
        <Button
          onClick={handleSend}
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          disabled={effectiveDisabled}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      ) : showVoice ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground flex-shrink-0"
          disabled={effectiveDisabled}
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          onClick={handleSend}
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          disabled
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default ChatComposerBar;
