/**
 * AI Session List Card Component
 * Card component for AI chat session list
 * @module shared/communications/chat/components/ai/AISessionCard
 */

"use client";

import React from "react";
import { Bot, Globe, MessageSquare, MoreVertical, Trash2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AISessionCardProps {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
  messageCount?: number;
  isActive?: boolean;
  isGlobal?: boolean;
  onClick?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  className?: string;
}

/**
 * Session card for AI chat list
 */
export function AISessionCard({
  id,
  title,
  lastMessage,
  timestamp,
  messageCount = 0,
  isActive = false,
  isGlobal = false,
  onClick,
  onArchive,
  onDelete,
  className,
}: AISessionCardProps) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50",
        className
      )}
      onClick={onClick}
    >
      {/* Bot Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            isGlobal
              ? "bg-gradient-to-br from-purple-500 to-pink-500"
              : "bg-gradient-to-br from-blue-600 to-purple-600"
          )}
        >
          <Bot className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-sm truncate">{title}</h4>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {timestamp}
          </span>
        </div>

        {lastMessage && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {lastMessage}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>{messageCount}</span>
          {isGlobal && (
            <>
              <Globe className="h-3 w-3 ml-2" />
              <span>Global</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {(onArchive || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute right-2 top-2"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onArchive && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default AISessionCard;
