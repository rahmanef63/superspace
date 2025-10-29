import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "@/frontend/features/chat/shared/stores";
import { TopBar } from "@/frontend/features/chat/components/navigation/TopBar";
import { AIListView } from "./AIListView";
import { AIDetailView } from "./AIDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui/layout/sidebar/secondary";

export function AIView() {
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
    // On mobile, show either AI chat list or AI chat detail, not both
    if (selectedChatId) {
      return (
        <div className="flex flex-col h-screen bg-background">
          <TopBar
            title="AI"
            showSearch={false}
            showActions={false}
            onMenuClick={handleBack}
            settingsSlug="ai"
          />
          <AIDetailView chatId={selectedChatId} />
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
          settingsSlug="ai"
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
      <AIDetailView chatId={selectedChatId} />
    </SecondarySidebarLayout>
  );
}
