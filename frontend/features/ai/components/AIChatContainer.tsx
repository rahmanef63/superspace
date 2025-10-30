/**
 * AI Chat Container
 * Bot interaction using shared/chat module
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer } from "@/frontend/shared/communications";
import { useConvexChatDataSource } from "@/frontend/features/chat/adapters/convexChatAdapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta, MessageDraft } from "@/frontend/shared/communications";

export type AIChatContainerProps = {
  workspaceId: Id<"workspaces"> | null;
  chatId?: string;
  botName?: string;
  botType?: "assistant" | "workflow" | "gpt" | "custom";
};

/**
 * AI Bot Chat using shared chat module
 */
export function AIChatContainer({
  workspaceId,
  chatId,
  botName = "AI",
  botType = "gpt",
}: AIChatContainerProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  const actualRoomId = chatId || `ai_${botType}_${workspaceId}`;

  // AI-specific message handler
  const handleAIMessage = async (draft: MessageDraft) => {
    console.log("AI Message sent:", draft);

    // TODO: Send to AI service
    // const response = await callAIService(draft.text);

    // TODO: Add AI response to chat
    // await dataSource.sendMessage(actualRoomId, {
    //   text: response,
    //   meta: { isBot: true, botType },
    // });
  };

  return (
    <div className="h-full w-full">
      <ChatContainer
        room={{ roomId: actualRoomId, provider: "convex" }}
        dataSource={dataSource}
        currentUser={chatUser}
        config={{
          contextMode: "workspace", // Using workspace mode for bot interaction
          isGroup: false, // 1-on-1 with bot
          threading: false, // Simple linear conversation
          canReply: false,
          reactionEnabled: true,
          mentionEnabled: false,
          readReceipts: false,
          typingIndicator: true, // Show when bot is "thinking"
          allowAttachments: true,
          linkPreview: true,
          imagePreview: true,
          mediaGallery: false,
          voiceRecorder: false,
          pinMessageEnabled: false,
          messageEditing: "author",
          messageDeletion: "author",
          customCommands: ["/help", "/clear", "/imagine", "/summarize"],
          integrations: [botType],
          linkedEntities: workspaceId ? [{ id: workspaceId, type: "workspace" }] : [],
        }}
        layout={{
          sidebar: false, // No sidebar for AI chat
          headerActions: ["search"],
          inputAccessories: ["attachments", "emoji", "commands"],
        }}
        events={{
          onSend: handleAIMessage,
          onCommand: async (cmd, args) => {
            console.log("AI Command:", cmd, args);

            switch (cmd) {
              case "/help":
                // Show AI capabilities
                break;
              case "/clear":
                // Clear conversation
                break;
              case "/imagine":
                // Generate image
                break;
              case "/summarize":
                // Summarize conversation
                break;
            }
          },
        }}
      />
    </div>
  );
}
