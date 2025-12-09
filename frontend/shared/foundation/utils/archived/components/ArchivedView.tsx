import { useWhatsAppStore } from "../../../../../features/chat/shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopBar } from "../../../../../features/chat/sections/center/TopBar";
import { ChatListView } from "../../../../../features/chat/sections/left/ChatListView";
import { ChatDetailView } from "../../../../../features/chat/sections/center/ChatDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";

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
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={<ChatListView showArchived variant="layout" />}
      contentClassName="flex h-full flex-col bg-background"
    >
      <ChatDetailView />
    </SecondarySidebarLayout>
  );
}
