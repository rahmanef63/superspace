import { useWhatsAppStore } from "../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListView } from "../components/chat/ChatListView";
import { ChatDetailView } from "./ChatDetailView";

export function ChatsView() {
  const { selectedChatId } = useWhatsAppStore();
  const isMobile = useIsMobile();

  if (isMobile) {
    // On mobile, show either chat list or chat detail, not both
    return selectedChatId ? <ChatDetailView /> : <ChatListView />;
  }

  return (
    <div className="flex h-full w-full">
      <ChatListView />
      <ChatDetailView />
    </div>
  );
}
