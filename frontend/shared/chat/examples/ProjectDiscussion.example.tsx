/**
 * Example: Project Discussion Chat
 * @module shared/chat/examples/ProjectDiscussion
 */

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { createConvexChatDataSource } from "../lib/chatClient";
import type { ChatRoomRef } from "../types/chat";
import type { UserMeta } from "../types/message";

/**
 * Project discussion example
 * Features: task-focused communication with mentions and pins
 */
export function ProjectDiscussionExample() {
  // TODO: Get from Convex hooks
  const convex = null as any;
  const currentUser: UserMeta = {
    id: "user_project_member",
    name: "Project Member",
    avatarUrl: undefined,
  };

  const projectId = "proj_alpha";
  const room: ChatRoomRef = {
    roomId: `project_${projectId}`,
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
          contextMode: "project",
          isGroup: true,
          threading: true,
          mentionEnabled: true,
          allowAttachments: true,
          linkPreview: true,
          pinMessageEnabled: true,
          messageEditing: "author",
          messageDeletion: "admin",
          linkedEntities: [{ id: projectId, type: "project" }],
          customCommands: ["/assign", "/milestone", "/status"],
        }}
        layout={{
          sidebar: true,
          headerActions: ["search", "pin"],
          inputAccessories: ["attachments", "emoji", "commands"],
        }}
        events={{
          onCommand: async (cmd, args) => {
            console.log("Project command:", cmd, args);
            // TODO: Integrate with project management
          },
        }}
      />
    </div>
  );
}
