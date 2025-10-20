/**
 * Example: Support/Helpdesk Chat
 * @module shared/chat/examples/SupportChat
 */

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { createConvexChatDataSource } from "../lib/chatClient";
import type { ChatRoomRef } from "../types/chat";
import type { UserMeta } from "../types/message";

/**
 * Support chat example
 * Features: ticket-based, moderation, file attachments, export
 */
export function SupportChatExample() {
  // TODO: Get from Convex hooks
  const convex = null as any; // useConvex()
  const currentUser: UserMeta = {
    id: "user_support_agent",
    name: "Support Agent",
    avatarUrl: undefined,
  };

  const ticketId = "ticket_12345";
  const room: ChatRoomRef = {
    roomId: `support_${ticketId}`,
    provider: "convex",
  };

  const dataSource = createConvexChatDataSource(convex, "chat");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ChatContainer
        room={room}
        dataSource={dataSource}
        currentUser={currentUser}
        config={{
          contextMode: "support",
          isGroup: false,
          threading: true,
          allowAttachments: true,
          maxAttachmentSizeMB: 10,
          fileViewer: true,
          messageEditing: "off",
          messageDeletion: "admin",
          moderationEnabled: true,
          allowExport: true,
          pinMessageEnabled: true,
          linkedEntities: [{ id: ticketId, type: "ticket" }],
        }}
        layout={{
          sidebar: true,
          headerActions: ["search", "pin", "filter"],
          inputAccessories: ["attachments", "emoji"],
        }}
        events={{
          onSend: async (draft) => {
            console.log("Support message sent:", draft);
            // TODO: Create ticket activity log
          },
          onModeration: async (result) => {
            if (result.action === "block") {
              console.warn("Message blocked by moderation:", result);
            }
          },
        }}
      />
    </div>
  );
}
