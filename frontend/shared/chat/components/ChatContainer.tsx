/**
 * Main chat container component
 * @module shared/chat/components/ChatContainer
 */

import React from "react";
import type { ChatRoomRef, ChatDataSource } from "../types/chat";
import type { UserMeta } from "../types/message";
import type { ChatConfig, ChatLayout } from "../types/config";
import type { ChatEvents } from "../types/events";
import { useChat } from "../hooks/useChat";
import { useChatScroll } from "../hooks/useChatScroll";
import { useChatPresence } from "../hooks/useChatPresence";
import { ChatHeader } from "./ChatHeader";
import { ChatSidebar } from "./ChatSidebar";
import { ChatThread } from "./ChatThread";
import { ChatInput } from "./ChatInput";

export type ChatContainerProps = {
  room: ChatRoomRef;
  dataSource: ChatDataSource;
  currentUser: UserMeta;
  config?: Partial<ChatConfig>;
  layout?: Partial<ChatLayout>;
  events?: ChatEvents;
  className?: string;
};

/**
 * Main chat container - the "ultimate" component
 * Orchestrates all chat functionality based on config
 */
export function ChatContainer({
  room,
  dataSource,
  currentUser,
  config: configPartial,
  layout: layoutPartial,
  events,
  className = "",
}: ChatContainerProps) {
  // Initialize chat state
  const chat = useChat({
    room,
    dataSource,
    currentUser,
    config: configPartial,
    events,
  });

  // Scroll management
  const scroll = useChatScroll({
    enabled: chat.config.autoScroll,
  });

  // Presence & typing
  const presence = useChatPresence({
    roomId: room.roomId,
    userId: currentUser.id,
    enabled: chat.config.typingIndicator,
  });

  const showSidebar = layoutPartial?.sidebar ?? false;
  const isReadOnly = chat.config.contextMode === "system";

  return (
    <div
      className={`chat-container ${className}`}
      data-theme={chat.config.theme}
      data-context={chat.config.contextMode}
    >
      {/* Header */}
      <ChatHeader
        room={chat.roomMeta}
        participants={chat.participants}
        actions={layoutPartial?.headerActions || []}
        config={chat.config}
        onRefresh={chat.refresh}
      />

      <div className="chat-body">
        {/* Main content */}
        <div className="chat-main">
          {/* Messages */}
          <ChatThread
            messages={chat.messages}
            currentUser={currentUser}
            roomMeta={chat.roomMeta}
            config={chat.config}
            scrollRef={scroll.scrollRef}
            onEdit={chat.editMessage}
            onDelete={chat.deleteMessage}
            onPin={chat.pinMessage}
            onReact={chat.reactToMessage}
            onLoadMore={chat.loadMore}
            hasMore={chat.hasMore}
            isLoading={chat.isLoading}
            typingUsers={presence.typingUsers}
          />

          {/* Input (hidden for read-only contexts) */}
          {!isReadOnly && (
            <ChatInput
              roomId={room.roomId}
              currentUser={currentUser}
              config={chat.config}
              accessories={layoutPartial?.inputAccessories || []}
              onSend={chat.sendMessage}
              onTyping={presence.setTyping}
              onUpload={events?.onUpload}
            />
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <ChatSidebar
            room={chat.roomMeta}
            participants={chat.participants}
            presence={presence.presence}
            config={chat.config}
          />
        )}
      </div>

      {/* Error display */}
      {chat.error && (
        <div className="chat-error" role="alert">
          {chat.error.message}
        </div>
      )}
    </div>
  );
}
