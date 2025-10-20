/**
 * CRM Client Chat
 * Customer relationship messaging
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/frontend/shared/chat";
import { useConvexChatDataSource } from "@/frontend/features/chat/adapters/convexChatAdapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/chat";

export type CRMChatContainerProps = {
  workspaceId: Id<"workspaces"> | null;
  customerId: string;
  customerName?: string;
};

export function CRMChatContainer({
  workspaceId,
  customerId,
  customerName = "Customer",
}: CRMChatContainerProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) return null;

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  return (
    <ChatContainer
      room={{ roomId: `crm_${customerId}`, provider: "convex" }}
      dataSource={dataSource}
      currentUser={chatUser}
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
          console.log("CRM message to customer:", customerId, draft);
          // TODO: Log to CRM activity
        },
      }}
    />
  );
}
