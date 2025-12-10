"use client";

import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/frontend/shared/ui/layout/header";
import { Sparkles } from "lucide-react";
import { AIListView } from "./AIListView";
import { AIDetailView } from "./AIDetailView";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { useAIStore } from "./stores";
import { useInitializeAI, useAIActions } from "./hooks";
import { AISessionInfoPanel } from "./components/AISessionInfoPanel";
import { AISessionInfoDrawer } from "./components/AISessionInfoDrawer";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";

export function AIView() {
  const isMobile = useIsMobile();

  // Initialize AI store with workspace context
  useInitializeAI();

  // Use store state and actions
  const selectedSessionId = useAIStore((s) => s.selectedSessionId);
  const selectedSession = useAIStore((s) => s.selectedSession);
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled);
  const { selectSession } = useAIActions();

  // Get setKnowledgeEnabled directly from store
  const handleKnowledgeToggle = useCallback((enabled: boolean) => {
    useAIStore.getState().setKnowledgeEnabled(enabled);
  }, []);

  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(!selectedSessionId);
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Toggle handlers
  const handleToggleLeftPanel = useCallback(() => {
    setLeftPanelCollapsed(prev => !prev);
  }, []);

  const handleToggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(prev => !prev);
  }, []);

  const handleChatSelect = (chatId: string) => {
    selectSession(chatId as any);
    // Auto-expand right panel when selecting a session
    setRightPanelCollapsed(false);
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
          <MobileHeader
            title="AI"
            icon={Sparkles}
            onBack={handleBack}
          />
          <AIDetailView chatId={selectedSessionId} />

          {/* Mobile: Use Drawer for session info */}
          <AISessionInfoDrawer
            session={selectedSession as any}
            isOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            onBack={() => setMobileDrawerOpen(false)}
            knowledgeEnabled={knowledgeEnabled}
            onKnowledgeToggle={handleKnowledgeToggle}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-background">
        <MobileHeader
          title="AI"
          icon={Sparkles}
          onBack={handleBack}
        />
        <AIListView
          selectedChatId={selectedSessionId ?? undefined}
          onChatSelect={handleChatSelect}
        />
      </div>
    );
  }

  // Desktop: Right panel content with toggle buttons
  const rightPanelContent = (
    <div className="flex flex-col h-full">
      {/* Quick actions bar with panel toggles */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLeftPanel}
          className="h-8 w-8 p-0"
          title={leftPanelCollapsed ? "Show session list" : "Hide session list"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground font-medium">Panels</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleRightPanel}
          className="h-8 w-8 p-0"
          title={rightPanelCollapsed ? "Show session info" : "Hide session info"}
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Session info panel content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AISessionInfoPanel
          session={selectedSession as any}
          onClose={() => setRightPanelCollapsed(true)}
          knowledgeEnabled={knowledgeEnabled}
          onKnowledgeToggle={handleKnowledgeToggle}
        />
      </div>
    </div>
  );

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
        // Responsive - right panel collapses first, left panel stays visible longer
        collapseRightAt={1024}
        collapseLeftAt={640}
        stackAt={480}
        // Controlled left panel state
        leftCollapsed={leftPanelCollapsed}
        onLeftCollapsedChange={setLeftPanelCollapsed}
        // Controlled right panel state
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />
    </div>
  );
}
