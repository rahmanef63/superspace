import { useWhatsAppStore } from "../../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListView } from "./ChatListView";
import { ChatDetailView } from "./ChatDetailView";
import { SecondarySidebarLayout } from "@/frontend/shared/ui";
import { ChatSkeleton } from "@/frontend/shared/ui/components/loading";

export function ChatsView() {
  // Use individual selectors to prevent unnecessary re-renders
  const selectedChatId = useWhatsAppStore((s) => s.selectedChatId);
  const isLoading = useWhatsAppStore((s) => s.isLoading);
  const chats = useWhatsAppStore((s) => s.chats);
  const isMobile = useIsMobile();

  // Only show skeleton on initial load (no chats yet)
  // This prevents blocking the UI when refreshing chats
  const showSkeleton = isLoading && chats.length === 0;

  if (showSkeleton) {
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
