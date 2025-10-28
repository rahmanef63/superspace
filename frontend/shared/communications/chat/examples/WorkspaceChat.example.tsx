/**
 * Example: Workspace Channel Chat
 * @module shared/chat/examples/WorkspaceChat
 */

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { createConvexChatDataSource } from "../lib/chatClient";
import type { ChatRoomRef } from "../types/chat";
import type { UserMeta } from "../types/message";

/**
 * Workspace chat example
 * Features: full-featured team chat with all bells and whistles
 */
export function WorkspaceChatExample() {
  // TODO: Get from Convex hooks
  const convex = null as any;
  const currentUser: UserMeta = {
    id: "user_team_member",
    name: "Team Member",
    avatarUrl: undefined,
  };

  const channelId = "channel_general";
  const room: ChatRoomRef = {
    roomId: channelId,
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
          voiceRecorder: true,
          pinMessageEnabled: true,
          allowInviteLink: true,
          allowExport: true,
          messageEditing: "author",
          messageDeletion: "admin",
          customCommands: ["/task", "/remind", "/poll"],
          integrations: ["taskBot", "calendarBot"],
        }}
        layout={{
          sidebar: true,
          headerActions: ["search", "sort", "pin", "invite"],
          inputAccessories: ["attachments", "emoji", "voice", "commands"],
        }}
        events={{
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
            }
          },
        }}
      />
    </div>
  );
}
