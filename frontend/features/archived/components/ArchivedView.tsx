import { useWhatsAppStore } from "../../chat/shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopBar } from "../../chat/components/navigation/TopBar";
import { ChatListView } from "../../chat/components/chat/ChatListView";
import { ChatDetailView } from "../../chat/components/chat/ChatDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui/layout/sidebar/secondary";

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
