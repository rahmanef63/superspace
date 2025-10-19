import { useWhatsAppStore } from "../../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopBar } from "../navigation/TopBar";
import { ChatListView } from "../chat/ChatListView";
import { ChatDetailView } from "../chat/ChatDetailView";

export function ArchivedView() {
  const { selectedChatId, setActiveTab } = useWhatsAppStore();
  const isMobile = useIsMobile();

  const handleBack = () => {
    setActiveTab('chats');
  };

  if (isMobile) {
    // On mobile, show either chat list or chat detail, not both
    if (selectedChatId) {
      return <ChatDetailView />;
    }
    
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar
          title="Archived"
          showSearch={true}
          showActions={false}
          onMenuClick={handleBack}
        />
        <ChatListView showArchived />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <ChatListView showArchived />
      <ChatDetailView />
    </div>
  );
}
