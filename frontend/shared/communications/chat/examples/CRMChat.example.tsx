/**
 * Example: CRM Customer Chat
 * @module shared/chat/examples/CRMChat
 */

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { createConvexChatDataSource } from "../lib/chatClient";
import type { ChatRoomRef } from "../types/chat";
import type { UserMeta } from "../types/message";

/**
 * CRM chat example
 * Features: customer messaging with export and moderation
 */
export function CRMChatExample() {
  // TODO: Get from Convex hooks
  const convex = null as any;
  const currentUser: UserMeta = {
    id: "user_sales_rep",
    name: "Sales Rep",
    avatarUrl: undefined,
  };

  const customerId = "customer_abc";
  const room: ChatRoomRef = {
    roomId: `crm_${customerId}`,
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
          contextMode: "crm",
          isGroup: false,
          threading: false,
          allowAttachments: true,
          fileViewer: true,
          messageEditing: "off",
          messageDeletion: "admin",
          allowExport: true,
          moderationEnabled: true,
          linkedEntities: [{ id: customerId, type: "customer" }],
        }}
        layout={{
          sidebar: true,
          headerActions: ["search", "filter"],
          inputAccessories: ["attachments"],
        }}
        events={{
          onSend: async (draft) => {
            console.log("CRM message sent:", draft);
            // TODO: Log to CRM activity timeline
          },
        }}
      />
    </div>
  );
}
