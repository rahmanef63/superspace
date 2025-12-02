import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pin } from "lucide-react";
import { getInitials, waClasses } from "../../utils";
import { truncateMessage } from "@/frontend/shared/ui/layout/sidebar/secondary/utils";
import type { Chat } from "@/frontend/features/chat/shared/types/core";

interface ChatListItemProps extends Chat {
  isActive?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function ChatListItem({
  avatar,
  name,
  lastMessage,
  timestamp,
  unreadCount,
  isPinned,
  isArchived,
  isActive,
  onClick,
  compact = false,
}: ChatListItemProps) {
  if (compact) {
    return (
      <div
        className={waClasses.chatItem(isActive || false)}
        onClick={onClick}
        title={name}
      >
        <Avatar className="h-8 w-8 shrink-0 mx-auto">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {unreadCount && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge className="bg-primary text-primary-foreground text-xs min-w-[16px] h-4 flex items-center justify-center rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={waClasses.chatItem(isActive || false)}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{name}</h3>
            {isPinned && <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">{timestamp}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate pr-2">
            {truncateMessage(lastMessage)}
          </p>
          <div className="flex items-center gap-1">
            {isArchived && (
              <Badge variant="secondary" className="text-xs">
                Archived
              </Badge>
            )}
            {unreadCount && unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
             )}
             </div>
            </div>
             <div className="flex items-center gap-1 flex-wrap">
              {(Array.isArray((arguments[0] as any)?.tags) ? (arguments[0] as any).tags : undefined)?.slice(0,3).map((tag: string) => (
               <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">{tag}</Badge>
              ))}
        </div>
      </div>
    </div>
  );
}
