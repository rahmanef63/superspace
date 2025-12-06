"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopBar } from "@/frontend/features/chat/components/navigation/TopBar";
import { AIListView } from "./AIListView";
import { AIDetailView } from "./AIDetailView";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { useAIStore } from "./stores";
import { useInitializeAI, useAIActions } from "./hooks";
import { AISessionInfoDrawer } from "./components/AISessionInfoDrawer";

export function AIView() {
  const isMobile = useIsMobile();
  
  // Initialize AI store with workspace context
  useInitializeAI();
  
  // Use store state and actions
  const selectedSessionId = useAIStore((s) => s.selectedSessionId);
  const selectedSession = useAIStore((s) => s.selectedSession);
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled);
  const { selectSession, setKnowledgeEnabled } = useAIActions();
  
  // Right panel state for session info
  const [sessionInfoOpen, setSessionInfoOpen] = useState(false);

  const handleChatSelect = (chatId: string) => {
    selectSession(chatId as any);
  };

  const handleBack = () => {
    if (selectedSessionId) {
      selectSession(null);
    }
  };

  if (isMobile) {
    // On mobile, show either AI chat list or AI chat detail, not both
    if (selectedSessionId) {
      return (
        <div className="flex flex-col h-full bg-background">
          <TopBar
            title="AI"
            showSearch={false}
            showActions={false}
            onMenuClick={handleBack}
          />
          <AIDetailView chatId={selectedSessionId} />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full bg-background">
        <TopBar
          title="AI"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <AIListView 
          selectedChatId={selectedSessionId ?? undefined} 
          onChatSelect={handleChatSelect} 
        />
      </div>
    );
  }

  // Right panel content - session info when a session is selected
  const rightPanelContent = selectedSession ? (
    <AISessionInfoDrawer
      session={selectedSession as any}
      isOpen={true}
      onClose={() => setSessionInfoOpen(false)}
      onBack={() => setSessionInfoOpen(false)}
      knowledgeEnabled={knowledgeEnabled}
      onKnowledgeToggle={setKnowledgeEnabled}
    />
  ) : null;

  return (
    <div className="h-full flex flex-col">
      <ThreeColumnLayoutAdvanced
        left={
          <AIListView
            selectedChatId={selectedSessionId ?? undefined}
            onChatSelect={handleChatSelect}
            variant="layout"
          />
        }
        center={<AIDetailView chatId={selectedSessionId ?? undefined} />}
        right={rightPanelContent}
        // Labels
        leftLabel="Sessions"
        centerLabel="AI Chat"
        rightLabel="Session Info"
        // Widths
        leftWidth={280}
        rightWidth={360}
        centerMinWidth={400}
        minSideWidth={220}
        maxSideWidth={480}
        collapsedWidth={44}
        // Space distribution
        spaceDistribution="center-priority"
        // Features - enable resize and collapse
        resizable={true}
        showCollapseButtons={true}
        persistState={true}
        storageKey="ai-layout"
        // Responsive
        collapseLeftAt={768}
        collapseRightAt={1024}
        stackAt={640}
        // Default states
        defaultLeftCollapsed={false}
        defaultRightCollapsed={!selectedSessionId}
      />
    </div>
  );
}
