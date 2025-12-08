/**
 * Chat Composer Bar (Legacy Export)
 * Re-exports ChatComposerBar for backward compatibility
 * @module features/chat
 */

"use client";

import { ComposerBar as SharedComposerBar } from "@/frontend/shared/communications/composer";
import { cn } from "@/lib/utils";

interface ComposerBarProps {
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Legacy ComposerBar - wraps shared component
 * @deprecated Use ChatComposerBar or shared ComposerBar directly
 */
export function ComposerBar({
  onSendMessage,
  placeholder,
  disabled = false,
  disabledReason,
}: ComposerBarProps) {
  const handleSend = (message: string) => {
    onSendMessage?.(message);
  };

  return (
    <SharedComposerBar
      context="chat"
      placeholder={placeholder}
      disabled={disabled}
      disabledReason={disabledReason}
      allowAttachments={true}
      allowEmoji={true}
      allowVoice={true}
      onSend={handleSend}
    />
  );
}

export default ComposerBar;
