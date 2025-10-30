/**
 * Workspace Chat Container
 * Refactored to use shared/chat module
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/frontend/shared/communications";
import { useConvexChatDataSource, useChatMessages, useChatRoom, useChatParticipants } from "../adapters/convexChatAdapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/communications";

export type WorkspaceChatContainerProps = {
  workspaceId: Id<"workspaces"> | null;
  roomId?: string;
  variant?: "full" | "compact";
};

/**
 * Workspace Chat using shared chat module
 */
export function WorkspaceChatContainer({
  workspaceId,
  roomId,
  variant = "full",
}: WorkspaceChatContainerProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  // Use hooks to fetch data reactively
  const messages = useChatMessages(roomId);
  const roomMeta = useChatRoom(roomId);
  const participants = useChatParticipants(roomId);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  const actualRoomId = roomId || `workspace_${workspaceId}`;

  return (
    <div className="h-full w-full">
      <ChatContainer
        room={{ roomId: actualRoomId, provider: "convex" }}
        dataSource={dataSource}
        currentUser={chatUser}
        config={{
          contextMode: "workspace",
          isGroup: true,
          threading: true,
          canReply: true,
          reactionEnabled: true,
          mentionEnabled: true,
          readReceipts: true,
          typingIndicator: true,
          allowAttachments: true,
          linkPreview: true,
          imagePreview: true,
          mediaGallery: true,
          voiceRecorder: false,
          pinMessageEnabled: true,
          allowInviteLink: true,
          allowExport: true,
          messageEditing: "author",
          messageDeletion: "admin",
          customCommands: ["/task", "/remind", "/poll", "/giphy"],
          linkedEntities: workspaceId ? [{ id: workspaceId, type: "workspace" }] : [],
        }}
        layout={{
          sidebar: variant === "full",
          headerActions: ["search", "pin", "filter", "invite"],
          inputAccessories: ["attachments", "emoji", "commands"],
        }}
        events={{
          onSend: async (draft) => {
            console.log("Workspace message sent:", draft);
            // TODO: Track analytics
          },
          onCommand: async (cmd, args) => {
            console.log("Command executed:", cmd, args);
            // TODO: Handle custom commands
            switch (cmd) {
              case "/task":
                // Create task
                break;
              case "/remind":
                // Set reminder
                break;
              case "/poll":
                // Create poll
                break;
              case "/giphy":
                // Search GIF
                break;
            }
          },
          onMention: async (userIds, messageId) => {
            console.log("Users mentioned:", userIds);
            // TODO: Send notifications
          },
        }}
      />
    </div>
  );
}
