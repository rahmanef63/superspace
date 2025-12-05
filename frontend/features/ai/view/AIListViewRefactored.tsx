/**
 * AI List View (Refactored)
 * Uses shared/communications AI components
 */

"use client";

import React, { useState } from "react";
import { Plus, Sparkles, Loader2, Bot, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/frontend/features/chat/components/ui/SearchBar";
import { GlobalModeToggle } from "@/frontend/shared/ui/components/controls";
import { useAIStore } from "@/frontend/features/ai/stores";
import { useAIActions } from "@/frontend/features/ai/hooks";
import {
  truncateMessage,
  formatSidebarTimestamp,
} from "@/frontend/shared/ui/layout/sidebar/secondary/utils";

// Local session card component (replaces old AISessionCard)
interface SessionCardProps {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  isActive: boolean;
  isGlobal?: boolean;
  onClick: () => void;
}

function SessionCard({
  title,
  lastMessage,
  timestamp,
  messageCount,
  isActive,
  isGlobal,
  onClick,
}: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors",
        "hover:bg-accent/50",
        isActive ? "bg-accent" : "bg-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isGlobal ? "bg-purple-500/10 text-purple-500" : "bg-primary/10 text-primary"
        )}>
          {isGlobal ? <Globe className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm text-foreground truncate">
              {title}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {timestamp}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {lastMessage}
          </p>
          <span className="text-xs text-muted-foreground/60">
            {messageCount} {messageCount === 1 ? "message" : "messages"}
          </span>
        </div>
      </div>
    </button>
  );
}

type AIListViewVariant = "standalone" | "layout";

interface AIListViewProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  variant?: AIListViewVariant;
}

export function AIListViewRefactored({
  selectedChatId: externalSelectedChatId,
  onChatSelect,
  variant = "standalone",
}: AIListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const isMobile = useIsMobile();

  // Use Zustand store
  const sessions = useAIStore((s) => s.sessions);
  const isLoading = useAIStore((s) => s.isLoading);
  const storeSelectedSessionId = useAIStore((s) => s.selectedSessionId);
  const globalMode = useAIStore((s) => s.globalMode);
  const setGlobalMode = useAIStore((s) => s.setGlobalMode);
  const { createSession, selectSession } = useAIActions();

  // Use external or store selectedChatId
  const selectedChatId = externalSelectedChatId ?? storeSelectedSessionId;

  // Transform sessions to display format
  const conversations = sessions.map((session) => ({
    id: session._id,
    title: session.title,
    lastMessage: truncateMessage(
      session.messages[session.messages.length - 1]?.content ?? "No messages yet"
    ),
    timestamp: formatSidebarTimestamp(session.updatedAt),
    messageCount: session.messages.length,
    isGlobal: session.isGlobal,
  }));

  const hasRealData = conversations.length > 0;

  const filteredChats = conversations.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const session = await createSession("New Chat");
      if (session && onChatSelect) {
        onChatSelect(session._id);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    selectSession(chatId as any);
    onChatSelect?.(chatId);
  };

  const handleGlobalModeToggle = (isGlobal: boolean) => {
    setGlobalMode(isGlobal);
  };

  const containerClasses = cn(
    "flex h-full flex-col",
    variant === "standalone"
      ? "w-full border-r border-border bg-card lg:w-[320px]"
      : "bg-background/60"
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            )}
            <h1 className="text-xl font-semibold text-foreground">AI</h1>
          </div>
          <div className="flex items-center gap-3">
            <GlobalModeToggle
              isGlobal={globalMode}
              onToggle={handleGlobalModeToggle}
              label="Global"
              size="sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleNewChat}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        <SearchBar
          placeholder="Search AI conversations"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* AI Chat History */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {/* Loading State */}
            {isLoading && (
              <div className="p-6 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Loading conversations...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasRealData && !searchQuery && (
              <div className="p-6 text-center">
                <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  {globalMode
                    ? "Start a private AI conversation"
                    : "Start a conversation with AI"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {globalMode
                    ? "Personal AI chats that aren't tied to any workspace."
                    : "Get help with writing, coding, learning, and more."}
                </p>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleNewChat}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  New Chat
                </Button>
              </div>
            )}

            {!isLoading && searchQuery && filteredChats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No AI conversations found
              </div>
            ) : (
              !isLoading &&
              hasRealData && (
                <div className="space-y-2">
                  {filteredChats.map((chat) => (
                    <SessionCard
                      key={chat.id}
                      id={chat.id}
                      title={chat.title}
                      lastMessage={chat.lastMessage}
                      timestamp={chat.timestamp}
                      messageCount={chat.messageCount}
                      isActive={chat.id === selectedChatId}
                      isGlobal={chat.isGlobal || globalMode}
                      onClick={() => handleChatSelect(chat.id)}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default AIListViewRefactored;
