/**
 * Example: Document Comments/Threads
 * @module shared/chat/examples/DocComments
 */

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { createConvexChatDataSource } from "../lib/chatClient";
import type { ChatRoomRef } from "../types/chat";
import type { UserMeta } from "../types/message";

/**
 * Document comments example
 * Features: threading, mentions, reactions, side panel
 */
export function DocCommentsExample() {
  // TODO: Get from Convex hooks
  const convex = null as any;
  const currentUser: UserMeta = {
    id: "user_doc_editor",
    name: "Doc Editor",
    avatarUrl: undefined,
  };

  const documentId = "doc_xyz";
  const room: ChatRoomRef = {
    roomId: `doc_comments_${documentId}`,
    provider: "convex",
  };

  const dataSource = createConvexChatDataSource(convex, "chat");

  return (
    <div style={{ width: "400px", height: "600px", position: "fixed", right: 0 }}>
      <ChatContainer
        room={room}
        dataSource={dataSource}
        currentUser={currentUser}
        config={{
          contextMode: "document",
          isGroup: true,
          threading: true,
          canReply: true,
          mentionEnabled: true,
          reactionEnabled: true,
          allowAttachments: false,
          messageEditing: "author",
          messageDeletion: "author",
          readReceipts: true,
          typingIndicator: true,
          linkedEntities: [{ id: documentId, type: "document" }],
        }}
        layout={{
          sidebar: false,
          headerActions: ["search"],
          inputAccessories: ["emoji"],
        }}
        events={{
          onMention: async (userIds, messageId) => {
            console.log("Users mentioned:", userIds, "in message:", messageId);
            // TODO: Send notifications
          },
        }}
      />
    </div>
  );
}
