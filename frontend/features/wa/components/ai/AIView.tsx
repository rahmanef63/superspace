import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../../shared/stores";
import { TopBar } from "../navigation/TopBar";
import { AIListView } from "./AIListView";
import { AIDetailView } from "./AIDetailView";

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
            title="Meta AI"
            showSearch={false}
            showActions={false}
            onMenuClick={handleBack}
          />
          <AIDetailView chatId={selectedChatId} />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          title="Meta AI"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <AIListView selectedChatId={selectedChatId} onChatSelect={setSelectedChatId} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <AIListView selectedChatId={selectedChatId} onChatSelect={setSelectedChatId} />
      <AIDetailView chatId={selectedChatId} />
    </div>
  );
}
