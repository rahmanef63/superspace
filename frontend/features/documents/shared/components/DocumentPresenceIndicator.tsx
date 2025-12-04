"use client";

import usePresence from "@convex-dev/presence/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DocumentPresenceIndicatorProps {
  roomId: string;
  userId: string;
  showLabel?: boolean;
  className?: string;
}

export function DocumentPresenceIndicator({
  roomId,
  userId,
  showLabel = false,
  className,
}: DocumentPresenceIndicatorProps) {
  // Don't render if we don't have valid room or user data
  if (!roomId || !userId) {
    return null;
  }

  let presenceState: Array<{
    userId: string;
    online: boolean;
    lastDisconnected: number;
    name?: string;
    image?: string;
  }> = [];

  try {
    presenceState = usePresence((api as any)["features/docs/presence"], roomId, userId) ?? [];
  } catch (error) {
    console.error("Error in presence hook:", error);
    presenceState = [];
  }

  // Filter to only show other users (not the current user)
  const otherUsers = presenceState.filter(p => p.userId !== userId && p.online);
  
  // Don't show anything if it's just the current user
  if (otherUsers.length === 0) {
    return null;
  }

  const maxAvatars = 3;
  const displayUsers = otherUsers.slice(0, maxAvatars);
  const remainingCount = otherUsers.length - maxAvatars;

  return (
    <TooltipProvider>
      <div className={cn("flex items-center", className)}>
        <div className="flex -space-x-2">
          {displayUsers.map((user, index) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 border-2 border-background ring-0">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name || "User"} />
                  ) : null}
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {user.name || "Anonymous"}
              </TooltipContent>
            </Tooltip>
          ))}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {remainingCount} more {remainingCount === 1 ? "user" : "users"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {showLabel && otherUsers.length > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {otherUsers.length} {otherUsers.length === 1 ? "collaborator" : "collaborators"}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
