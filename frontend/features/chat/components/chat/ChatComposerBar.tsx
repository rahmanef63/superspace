/**
 * Chat Composer Bar
 * Wrapper around shared ComposerBar with chat-specific defaults
 * @module features/chat
 */

"use client";

import { ComposerBar } from "@/frontend/shared/communications/composer";
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
 * Chat-specific composer bar using shared component
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
  const handleSend = async (message: string) => {
    await onSend(message);
  };

  return (
    <ComposerBar
      context="chat"
      placeholder={placeholder}
      disabled={disabled}
      disabledReason={disabledReason}
      isSending={isSending}
      allowAttachments={showAttachments}
      allowEmoji={showEmoji}
      allowVoice={showVoice}
      onSend={handleSend}
      className={cn(className)}
    />
  );
}

export default ChatComposerBar;
