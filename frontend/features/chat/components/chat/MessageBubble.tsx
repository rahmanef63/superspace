import { 
  Check, 
  CheckCheck, 
  Loader2, 
  Copy, 
  Reply, 
  Forward, 
  Smile, 
  Pencil, 
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatTimestamp, waClasses } from "../../utils";
import type { Message } from "../../shared/types/core";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Quick emoji reactions for chat
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// Default workspace color (indigo) - can be overridden via prop
const DEFAULT_WORKSPACE_COLOR = "#6366f1";
const PUBLIC_READ_COLOR = "#3b82f6"; // Blue for public

interface ReplyContext {
  id: string;
  text: string;
  senderName?: string;
}

interface MessageBubbleProps extends Message {
  /** Callback when user reacts with emoji */
  onReact?: (emoji: string) => void;
  /** Callback when user wants to reply */
  onReply?: () => void;
  /** Callback when user wants to forward */
  onForward?: () => void;
  /** Callback when message is edited */
  onEdit?: (newText: string) => void;
  /** Callback when message is deleted */
  onDelete?: () => void;
  /** Current reactions on the message */
  reactions?: Array<{ emoji: string; count: number; hasReacted?: boolean }>;
  /** Reply context - the message this is replying to */
  replyContext?: ReplyContext;
  /** Whether this message is selected */
  isSelected?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selected: boolean) => void;
  /** Whether selection mode is active */
  selectionMode?: boolean;
  /** Workspace color for read indicator */
  workspaceColor?: string;
  /** Whether this is a public/global chat */
  isPublic?: boolean;
  /** Sender name for received messages */
  senderName?: string;
  /** Sender avatar for received messages */
  senderAvatar?: string;
}

export function MessageBubble({
  id,
  text,
  timestamp,
  variant,
  status,
  onReact,
  onReply,
  onForward,
  onEdit,
  onDelete,
  reactions = [],
  replyContext,
  isSelected = false,
  onSelectionChange,
  selectionMode = false,
  workspaceColor = DEFAULT_WORKSPACE_COLOR,
  isPublic = false,
  senderName,
  senderAvatar,
}: MessageBubbleProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  const isOwn = variant === 'sent';
  const isSystem = variant === 'system';

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleEditSave = () => {
    if (editText.trim() && editText !== text) {
      onEdit?.(editText.trim());
      toast.success("Message edited");
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Get read indicator color
  const readColor = isPublic ? PUBLIC_READ_COLOR : workspaceColor;

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
    <div className={cn(
      "flex mb-3 group relative",
      isOwn ? "justify-end" : "justify-start",
      selectionMode && "pl-10"
    )}>
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange?.(checked === true)}
            className="h-5 w-5"
          />
        </div>
      )}

      <div className={cn(
        "flex flex-col",
        // Dynamic width: min 80px, max 85% of container, expands with content
        "min-w-[80px] max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]"
      )}>
        {/* Message Actions */}
        <div className={cn(
          "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1",
          isOwn ? "flex-row-reverse justify-start" : "flex-row justify-start"
        )}>
          {/* Quick Emoji React */}
          <Popover open={showEmojis} onOpenChange={setShowEmojis}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-2" 
              side={isOwn ? "left" : "right"}
              align="start"
            >
              <div className="flex gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact?.(emoji);
                      setShowEmojis(false);
                      toast.success(`Reacted with ${emoji}`);
                    }}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reply */}
          {onReply && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    onReply();
                    toast.info("Reply mode active");
                  }}
                >
                  <Reply className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>
          )}

          {/* Forward */}
          {onForward && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={onForward}
                >
                  <Forward className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </Tooltip>
          )}

          {/* Copy */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
          </Tooltip>

          {/* Edit - only for own messages */}
          {isOwn && onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          )}

          {/* Delete - only for own messages */}
          {isOwn && onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm("Delete this message?")) {
                      onDelete();
                      toast.success("Message deleted");
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Reply Context - Show the message being replied to */}
        {replyContext && (
          <div className={cn(
            "mb-1 px-3 py-1.5 rounded-t-lg border-l-4 text-xs",
            isOwn 
              ? "bg-primary/20 border-primary/60 ml-auto" 
              : "bg-muted border-muted-foreground/40"
          )}>
            {replyContext.senderName && (
              <span className="font-semibold text-foreground/80 block">
                {replyContext.senderName}
              </span>
            )}
            <p className="text-muted-foreground truncate max-w-[200px]">
              {replyContext.text}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          waClasses.messageBubble(variant as 'sent' | 'received'),
          // Ensure bubble expands properly
          "w-fit"
        )}>
          {/* Sender name for group chats (received messages only) */}
          {!isOwn && senderName && (
            <p className="text-xs font-semibold text-primary mb-1">
              {senderName}
            </p>
          )}

          {/* Message content or edit input */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm bg-background"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-green-500 hover:text-green-600"
                onClick={handleEditSave}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive"
                onClick={handleEditCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {text}
            </p>
          )}

          {/* Timestamp and status */}
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
                  <CheckCheck 
                    className="h-3 w-3" 
                    style={{ color: readColor }}
                    aria-label="Read" 
                  />
                ) : status === 'delivered' ? (
                  <CheckCheck className="h-3 w-3" aria-label="Delivered" />
                ) : (
                  <Check className="h-3 w-3" aria-label="Sent" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Existing Reactions */}
        {reactions.length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => {
                  onReact?.(reaction.emoji);
                  toast.success(reaction.hasReacted ? `Removed ${reaction.emoji}` : `Reacted with ${reaction.emoji}`);
                }}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full border transition-colors",
                  reaction.hasReacted 
                    ? "bg-primary/10 border-primary text-foreground" 
                    : "bg-muted border-transparent hover:border-border"
                )}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
