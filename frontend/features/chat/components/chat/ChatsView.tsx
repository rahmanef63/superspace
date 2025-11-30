import { useWhatsAppStore } from "../../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListView } from "./ChatListView";
import { ChatDetailView } from "./ChatDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { ChatSkeleton } from "@/frontend/shared/ui/components/loading";

export function ChatsView() {
  const { selectedChatId, isLoading } = useWhatsAppStore();
  const isMobile = useIsMobile();

  // Show skeleton while initial data is loading
  if (isLoading) {
    return <ChatSkeleton />;
  }

  if (isMobile) {
    // On mobile, show either chat list or chat detail, not both
    return selectedChatId ? <ChatDetailView /> : <ChatListView />;
  }

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      sidebar={<ChatListView variant="layout" />}
      contentClassName="flex h-full flex-col bg-background"
    >
      <ChatDetailView />
    </SecondarySidebarLayout>
  );
}
