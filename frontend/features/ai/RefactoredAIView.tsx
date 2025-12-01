/**
 * Refactored AI View using shared/chat
 */

"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Id } from "@/convex/_generated/dataModel";
import { useWhatsAppStore } from "@/frontend/features/chat/shared/stores";
import { TopBar } from "@/frontend/features/chat/components/navigation/TopBar";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { AIListView } from "./AIListView";
import { AIChatContainer } from "./components/AIChatContainer";

export type RefactoredAIViewProps = {
  workspaceId: Id<"workspaces"> | null;
};

export function RefactoredAIView({ workspaceId }: RefactoredAIViewProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const isMobile = useIsMobile();
  const { setActiveTab } = useWhatsAppStore();

  const handleBack = () => {
    if (selectedChatId) {
      setSelectedChatId(undefined);
    } else {
      setActiveTab('chats');
    }
  };

  if (isMobile) {
    if (selectedChatId) {
      return (
        <div className="flex flex-col h-screen bg-background">
          <TopBar
            title="AI"
            showSearch={false}
            showActions={false}
            onMenuClick={handleBack}
          />
          <AIChatContainer
            workspaceId={workspaceId}
            chatId={selectedChatId}
            botType="gpt"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          title="AI"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <AIListView selectedChatId={selectedChatId} onChatSelect={setSelectedChatId} />
      </div>
    );
  }

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={
        <AIListView
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
          variant="layout"
        />
      }
      contentClassName="flex h-full flex-col bg-background"
    >
      {selectedChatId ? (
        <AIChatContainer
          workspaceId={workspaceId}
          chatId={selectedChatId}
          botType="gpt"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a conversation or start a new one
        </div>
      )}
    </SecondarySidebarLayout>
  );
}
