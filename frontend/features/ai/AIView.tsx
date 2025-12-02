import { useIsMobile } from "@/hooks/use-mobile";
import { TopBar } from "@/frontend/features/chat/components/navigation/TopBar";
import { AIListView } from "./AIListView";
import { AIDetailView } from "./AIDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { useAIStore } from "./stores";
import { useInitializeAI, useAIActions } from "./hooks";

export function AIView() {
  const isMobile = useIsMobile();
  
  // Initialize AI store with workspace context
  useInitializeAI();
  
  // Use store state and actions
  const selectedSessionId = useAIStore((s) => s.selectedSessionId);
  const { selectSession } = useAIActions();

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
        <div className="flex flex-col h-screen bg-background">
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
      <div className="flex flex-col h-screen bg-background">
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

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={
        <AIListView
          selectedChatId={selectedSessionId ?? undefined}
          onChatSelect={handleChatSelect}
          variant="layout"
        />
      }
      contentClassName="flex h-full flex-col bg-background"
    >
      <AIDetailView chatId={selectedSessionId ?? undefined} />
    </SecondarySidebarLayout>
  );
}
