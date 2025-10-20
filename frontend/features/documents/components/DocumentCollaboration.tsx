/**
 * Document Collaboration Chat
 * Real-time comments for document editing
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/frontend/shared/chat";
import { useConvexChatDataSource } from "@/frontend/features/chat/adapters/convexChatAdapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/chat";

export type DocumentCollaborationProps = {
  workspaceId: Id<"workspaces"> | null;
  documentId: string;
  documentTitle?: string;
  position?: "right" | "bottom";
  width?: number;
};

export function DocumentCollaboration({
  workspaceId,
  documentId,
  documentTitle = "Document",
  position = "right",
  width = 350,
}: DocumentCollaborationProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) return null;

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  return (
    <div
      style={{
        position: "fixed",
        [position]: 0,
        top: 0,
        bottom: 0,
        width: `${width}px`,
        borderLeft: position === "right" ? "1px solid var(--border)" : undefined,
        borderTop: position === "bottom" ? "1px solid var(--border)" : undefined,
        zIndex: 40,
        backgroundColor: "var(--background)",
      }}
    >
      <ChatContainer
        room={{ roomId: `doc_${documentId}`, provider: "convex" }}
        dataSource={dataSource}
        currentUser={chatUser}
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
          onMention: async (userIds) => {
            console.log("Mentioned in document:", userIds);
            // TODO: Send notifications
          },
        }}
      />
    </div>
  );
}
