/**
 * Workflow Assistant Chat
 * Bot for workflow automation
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/frontend/shared/chat";
import { useConvexChatDataSource } from "@/frontend/features/chat/adapters/convexChatAdapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/chat";

export type WorkflowAssistantChatProps = {
  workspaceId: Id<"workspaces"> | null;
  workflowId?: string;
};

export function WorkflowAssistantChat({
  workspaceId,
  workflowId,
}: WorkflowAssistantChatProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) return null;

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  const roomId = workflowId ? `workflow_${workflowId}` : `workflow_assistant`;

  return (
    <ChatContainer
      room={{ roomId, provider: "convex" }}
      dataSource={dataSource}
      currentUser={chatUser}
      config={{
        contextMode: "workspace",
        isGroup: false,
        threading: false,
        reactionEnabled: false,
        mentionEnabled: false,
        readReceipts: false,
        typingIndicator: true,
        allowAttachments: true,
        messageEditing: "author",
        messageDeletion: "author",
        customCommands: [
          "/help",
          "/create-workflow",
          "/trigger",
          "/list",
          "/status",
        ],
        integrations: ["workflow_bot"],
      }}
      layout={{
        sidebar: false,
        headerActions: ["search"],
        inputAccessories: ["attachments", "commands"],
      }}
      events={{
        onSend: async (draft) => {
          console.log("Workflow assistant message:", draft);
          // TODO: Process with workflow engine
        },
        onCommand: async (cmd, args) => {
          console.log("Workflow command:", cmd, args);
          switch (cmd) {
            case "/create-workflow":
              // Create new workflow
              break;
            case "/trigger":
              // Trigger workflow
              break;
            case "/list":
              // List workflows
              break;
            case "/status":
              // Show workflow status
              break;
          }
        },
      }}
    />
  );
}
