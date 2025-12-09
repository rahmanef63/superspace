import { useState, type ComponentType, type ReactNode } from "react";
import {
  Reply,
  Copy,
  Forward,
  Star,
  Pin,
  Trash2,
  Share,
  CheckSquare,
  Plus,
  Info,
  ChevronDown,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MessageContextAction = {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  destructive?: boolean;
};

export type MessageContextMenuProps = {
  children: ReactNode;
  quickReactions?: string[];
  actions?: MessageContextAction[];
  onReaction?: (emoji: string) => void;
  onMoreReactions?: () => void;
  className?: string;
};

// Common emoji reactions like WhatsApp/Telegram
const DEFAULT_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const DEFAULT_ACTIONS: MessageContextAction[] = [
  { id: "reply", label: "Reply", icon: Reply },
  { id: "copy", label: "Copy", icon: Copy },
  { id: "forward", label: "Forward", icon: Forward },
  { id: "star", label: "Star", icon: Star },
  { id: "pin", label: "Pin", icon: Pin },
  { id: "delete", label: "Delete", icon: Trash2, destructive: true },
  { id: "select", label: "Select", icon: CheckSquare },
  { id: "share", label: "Share", icon: Share },
  { id: "info", label: "Info", icon: Info },
];

// Shared menu content for both context menu and dropdown
function MenuContent({
  actions,
  quickReactions,
  onReaction,
  onMoreReactions,
  ItemComponent,
}: {
  actions: MessageContextAction[];
  quickReactions: string[];
  onReaction?: (emoji: string) => void;
  onMoreReactions?: () => void;
  ItemComponent: typeof ContextMenuItem | typeof DropdownMenuItem;
}) {
  return (
    <>
      {/* Action Items */}
      <div className="py-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <ItemComponent
              key={action.id}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 cursor-pointer text-white/90 hover:text-white focus:bg-white/10 focus:text-white",
                action.destructive && "text-red-400 focus:text-red-400 focus:bg-red-500/10"
              )}
            >
              {Icon && <Icon className="h-5 w-5 opacity-80" />}
              <span className="text-sm">{action.label}</span>
            </ItemComponent>
          );
        })}
      </div>

      {/* Quick Reactions Row - at the bottom like WhatsApp */}
      <div className="flex items-center justify-between px-3 py-3 border-t border-white/10">
        {quickReactions.map((emoji) => (
          <button
            key={emoji}
            className="text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
            onClick={() => onReaction?.(emoji)}
            type="button"
          >
            {emoji}
          </button>
        ))}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/60 hover:text-white"
          onClick={onMoreReactions}
          type="button"
          title="More reactions"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

export function MessageContextMenu({
  children,
  quickReactions = DEFAULT_REACTIONS,
  actions = DEFAULT_ACTIONS,
  onReaction,
  onMoreReactions,
  className,
}: MessageContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className={cn("w-56 bg-[#1f1f1f] border-white/10 p-0", className)}
      >
        <MenuContent
          actions={actions}
          quickReactions={quickReactions}
          onReaction={onReaction}
          onMoreReactions={onMoreReactions}
          ItemComponent={ContextMenuItem}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Dropdown menu triggered by hover arrow button
export type MessageDropdownMenuProps = {
  quickReactions?: string[];
  actions?: MessageContextAction[];
  onReaction?: (emoji: string) => void;
  onMoreReactions?: () => void;
  className?: string;
  side?: "left" | "right";
};

export function MessageDropdownMenu({
  quickReactions = DEFAULT_REACTIONS,
  actions = DEFAULT_ACTIONS,
  onReaction,
  onMoreReactions,
  className,
  side = "left",
}: MessageDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] text-white/70 hover:text-white",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            className
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align="start"
        className="w-56 bg-[#1f1f1f] border-white/10 p-0"
      >
        <MenuContent
          actions={actions}
          quickReactions={quickReactions}
          onReaction={onReaction}
          onMoreReactions={onMoreReactions}
          ItemComponent={DropdownMenuItem}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
