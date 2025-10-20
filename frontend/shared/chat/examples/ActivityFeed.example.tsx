/**
 * Example: Activity Feed (Read-only)
 * @module shared/chat/examples/ActivityFeed
 */

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { createConvexChatDataSource } from "../lib/chatClient";
import type { ChatRoomRef } from "../types/chat";
import type { UserMeta } from "../types/message";

/**
 * Activity feed example
 * Features: read-only system notifications
 */
export function ActivityFeedExample() {
  // TODO: Get from Convex hooks
  const convex = null as any;
  const currentUser: UserMeta = {
    id: "user_viewer",
    name: "Viewer",
    avatarUrl: undefined,
  };

  const room: ChatRoomRef = {
    roomId: "system_activity_feed",
    provider: "convex",
  };

  const dataSource = createConvexChatDataSource(convex, "chat");

  return (
    <div style={{ width: "350px", height: "500px" }}>
      <ChatContainer
        room={room}
        dataSource={dataSource}
        currentUser={currentUser}
        config={{
          contextMode: "system",
          isGroup: false,
          threading: false,
          reactionEnabled: false,
          mentionEnabled: false,
          allowAttachments: false,
          messageEditing: "off",
          messageDeletion: "off",
          readReceipts: false,
          typingIndicator: false,
          pinMessageEnabled: false,
        }}
        layout={{
          sidebar: false,
          headerActions: ["filter"],
          inputAccessories: [], // No input for read-only mode
        }}
      />
    </div>
  );
}
