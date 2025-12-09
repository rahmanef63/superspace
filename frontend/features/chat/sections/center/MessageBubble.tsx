import {
  Check,
  CheckCheck,
  Loader2,
  Copy,
  Reply,
  Forward,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Paperclip,
  Star,
  Pin,
  CheckSquare,
  Share,
  Info,
} from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from "react";
import { formatTimestamp as chatFormatTimestamp, getInitials } from "../../utils";
import type { Message } from "../../shared/types/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatFileSize } from "@/frontend/shared/communications/chat/util/formatMessage";
import { MessageContextMenu, MessageDropdownMenu } from "../../components/chat/context-menu";

// WhatsApp-style emoji reactions
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const DEFAULT_WORKSPACE_COLOR = "#6366f1";
const PUBLIC_READ_COLOR = "#3b82f6";

interface ReplyContext {
  id: string;
  text: string;
  senderName?: string;
}

interface MessageBubbleProps extends Message {
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
  reactions?: Array<{ emoji: string; count: number; hasReacted?: boolean }>;
  replyContext?: ReplyContext;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  selectionMode?: boolean;
  workspaceColor?: string;
  isPublic?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function MessageBubble({
  text,
  timestamp,
  variant,
  status,
  type,
  mediaUrl,
  fileName,
  fileSize,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const editInputRef = useRef<HTMLInputElement>(null);

  const isOwn = variant === "sent";
  const isSystem = variant === "system";

  const resolvedFileSize = useMemo(() => {
    if (!fileSize) return undefined;
    const numeric = Number(fileSize);
    if (!Number.isFinite(numeric)) return undefined;
    return formatFileSize(numeric);
  }, [fileSize]);

  const formattedTime = useMemo(() => {
    if (!timestamp) return "-";
    if (typeof timestamp === "string" && timestamp.match(/am|pm|AM|PM|\d{2}:\d{2}/)) {
      return timestamp;
    }
    const numericTimestamp = Number(timestamp);
    if (!Number.isNaN(numericTimestamp)) {
      return chatFormatTimestamp(numericTimestamp);
    }
    return String(timestamp);
  }, [timestamp]);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

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

  const renderAttachment = () => {
    if ((type === "image" || (mediaUrl && type === "text")) && mediaUrl) {
      return (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-background/70 shadow-md">
          <img
            src={mediaUrl}
            alt={fileName || "Attachment"}
            className="max-h-80 w-full object-cover"
            loading="lazy"
          />
          {fileName && (
            <p className="px-3 py-2 text-xs text-white/80 bg-black/40">
              {fileName}
            </p>
          )}
        </div>
      );
    }

    if (type === "document" || fileName) {
      return (
        <a
          href={mediaUrl || undefined}
          target={mediaUrl ? "_blank" : undefined}
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          <Paperclip className="h-4 w-4 text-white/80" />
          <div className="min-w-0">
            <p className="font-medium truncate text-white">
              {fileName ?? "Attachment"}
            </p>
            {resolvedFileSize && (
              <p className="text-[11px] text-white/70">
                {resolvedFileSize}
              </p>
            )}
          </div>
        </a>
      );
    }

    return null;
  };

  const renderReplyContext = () => {
    if (!replyContext) return null;
    return (
      <div
        className={cn(
          "mb-1 px-3 py-1.5 rounded-t-lg border-l-4 text-xs",
          isOwn
            ? "bg-primary/20 border-primary/60 ml-auto"
            : "bg-muted border-muted-foreground/40",
        )}
      >
        {replyContext.senderName && (
          <span className="font-semibold text-foreground/80 block">
            {replyContext.senderName}
          </span>
        )}
        <p className="text-muted-foreground truncate max-w-[240px]">
          {replyContext.text}
        </p>
      </div>
    );
  };

  const actionItems = [
    onReply && { id: "reply", label: "Reply", icon: Reply, onClick: () => onReply?.() },
    { id: "copy", label: "Copy", icon: Copy, onClick: handleCopy },
    onForward && { id: "forward", label: "Forward", icon: Forward, onClick: () => onForward?.() },
    { id: "star", label: "Star", icon: Star, onClick: () => toast.success("Message starred") },
    { id: "pin", label: "Pin", icon: Pin, onClick: () => toast.success("Message pinned") },
    onDelete && { id: "delete", label: "Delete", icon: Trash2, destructive: true, onClick: () => { if (confirm("Delete this message?")) { onDelete?.(); toast.success("Message deleted"); } } },
    { id: "select", label: "Select", icon: CheckSquare, onClick: () => onSelectionChange?.(!isSelected) },
    { id: "share", label: "Share", icon: Share, onClick: () => toast.success("Share dialog opened") },
    { id: "info", label: "Info", icon: Info, onClick: () => toast.success("Message info opened") },
  ].filter(Boolean) as Array<{ id: string; label: string; icon?: React.ComponentType<{ className?: string }>; destructive?: boolean; onClick: () => void }>;

  // Dropdown arrow that appears on hover (positioned beside the bubble)
  const renderDropdownArrow = (
    <div
      className={cn(
        "absolute top-1",
        isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1",
      )}
    >
      <MessageDropdownMenu
        actions={actionItems}
        quickReactions={QUICK_EMOJIS}
        onReaction={onReact}
        side={isOwn ? "left" : "right"}
      />
    </div>
  );

  return (
    <MessageContextMenu
      quickReactions={QUICK_EMOJIS}
      actions={actionItems}
      onReaction={onReact}
    >
      <div
        className={cn(
          "flex gap-2 mb-3 group relative",
          isOwn ? "justify-end" : "justify-start",
          selectionMode && "pl-10",
        )}
      >
        {selectionMode && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange?.(checked === true)}
              className="h-5 w-5"
            />
          </div>
        )}

        {!isOwn && (
          <Avatar className="h-8 w-8 mt-auto">
            <AvatarImage src={senderAvatar} alt={senderName} />
            <AvatarFallback className="bg-muted text-xs">
              {senderName ? getInitials(senderName) : "?"}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col relative",
            "min-w-[80px] max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]",
          )}
        >
          {renderDropdownArrow}
          {renderReplyContext()}

          <div
            className={cn(
              "relative rounded-2xl px-3 py-2 w-fit shadow-sm border border-white/5",
              isOwn
                ? "bg-[#075e54] text-white rounded-br-md"
                : "bg-[#1f2c34] text-white rounded-bl-md",
            )}
          >
            {!isOwn && senderName && (
              <p className="text-xs font-semibold text-[#6fd2b5] mb-1">
                {senderName}
              </p>
            )}

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
              <div className="space-y-2">
                {renderAttachment()}
                {text && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {text}
                  </p>
                )}
              </div>
            )}

            <div
              className={cn(
                "flex items-center gap-1 mt-1 text-[11px] tracking-tight",
                "text-white/70",
                "justify-end",
              )}
            >
              <span>{formattedTime}</span>
              {isOwn && (
                <div className="flex items-center" aria-label={status || "sent"}>
                  {status === "sending" ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-label="Sending" />
                  ) : status === "read" ? (
                    <CheckCheck
                      className="h-3 w-3"
                      style={{ color: readColor }}
                      aria-label="Read"
                    />
                  ) : status === "delivered" ? (
                    <CheckCheck className="h-3 w-3" aria-label="Delivered" />
                  ) : (
                    <Check className="h-3 w-3" aria-label="Sent" />
                  )}
                </div>
              )}
            </div>

            {reactions.length > 0 && (
              <div className="absolute -bottom-3 right-2 bg-white/90 text-sm rounded-full px-2 py-0.5 shadow">
                {reactions[0].emoji}
              </div>
            )}
          </div>

          {reactions.length > 1 && (
            <div
              className={cn(
                "flex flex-wrap gap-1 mt-2",
                isOwn ? "justify-end" : "justify-start",
              )}
            >
              {reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => {
                    onReact?.(reaction.emoji);
                    toast.success(
                      reaction.hasReacted
                        ? `Removed ${reaction.emoji}`
                        : `Reacted with ${reaction.emoji}`,
                    );
                  }}
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full border transition-colors",
                    reaction.hasReacted
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-muted border-transparent hover:border-border",
                  )}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </MessageContextMenu>
  );
}
