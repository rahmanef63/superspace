import { Check, CheckCheck, Loader2 } from "lucide-react";
import { formatTimestamp, waClasses } from "../../utils";
import type { Message } from "@/frontend/shared/foundation/types";

interface MessageBubbleProps extends Message {}

export function MessageBubble({
  text,
  timestamp,
  variant,
  status,
}: MessageBubbleProps) {
  const isOwn = variant === 'sent';
  const isSystem = variant === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={waClasses.messageBubble(variant as 'sent' | 'received')}>
        <p className="text-sm whitespace-pre-wrap break-words">
          {text}
        </p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          <span>{formatTimestamp(timestamp)}</span>
          {isOwn && (
            <div className="flex items-center" aria-label={status || 'sent'}>
              {status === 'sending' ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-label="Sending" />
              ) : status === 'read' ? (
                <CheckCheck className="h-3 w-3 text-blue-400" aria-label="Read" />
              ) : status === 'delivered' ? (
                <CheckCheck className="h-3 w-3" aria-label="Delivered" />
              ) : (
                <Check className="h-3 w-3" aria-label="Sent" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
