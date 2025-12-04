/**
 * AI Header Component
 * Header for AI chat with bot info and controls
 * @module shared/communications/chat/components/ai/AIHeader
 */

"use client";

import React from "react";
import { Bot, Settings, MoreVertical, Trash2, Archive, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AISession, AIBotConfig } from "../../types/ai";

export interface AIHeaderProps {
  session?: AISession | null;
  bot?: AIBotConfig;
  messageCount?: number;
  onBack?: () => void;
  onSettings?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  showBackButton?: boolean;
  className?: string;
}

/**
 * AI Chat header component
 */
export function AIHeader({
  session,
  bot,
  messageCount,
  onBack,
  onSettings,
  onArchive,
  onDelete,
  showBackButton = false,
  className,
}: AIHeaderProps) {
  const title = session?.title || bot?.name || "AI Assistant";
  const subtitle = messageCount !== undefined 
    ? `${messageCount} message${messageCount !== 1 ? "s" : ""}`
    : "Ask me anything";

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b border-border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Bot Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
          {bot?.avatarUrl ? (
            <img
              src={bot.avatarUrl}
              alt={bot.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {(onArchive || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive conversation
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete conversation
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default AIHeader;
