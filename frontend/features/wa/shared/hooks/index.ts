// Custom hooks for WhatsApp Clone feature
import { useEffect } from 'react';
import { useWhatsAppStore } from '../stores';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConvex } from 'convex/react';
import { useWorkspaceContext } from '@/app/dashboard/WorkspaceProvider';
import { ConvexChatRepository } from '../data/adapters/convex.adapter';

// Hook to initialize WhatsApp data
export const useInitializeWhatsApp = () => {
  const convex = useConvex();
  const { workspaceId } = useWorkspaceContext();
  const init = useWhatsAppStore((s) => s.init);
  const loadChats = useWhatsAppStore((s) => s.loadChats);

  useEffect(() => {
    if (workspaceId) {
      const repo = new ConvexChatRepository({ client: convex as any, workspaceId: workspaceId as any });
      init(repo, String(workspaceId));
      // Kick initial load
      loadChats();
    }
  }, [convex, workspaceId, init, loadChats]);
};

// Hook to get current chat data
export const useCurrentChat = () => {
  const { chats, selectedChatId } = useWhatsAppStore();
  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  
  return { selectedChat, selectedChatId };
};

// Hook to handle mobile-specific WhatsApp behavior
export const useMobileWhatsApp = () => {
  const isMobile = useIsMobile();
  const { selectedChatId, setSelectedChat, setActiveTab } = useWhatsAppStore();
  
  const handleBack = () => {
    if (isMobile) {
      setSelectedChat(null);
      setActiveTab('chats');
    }
  };
  
  return {
    isMobile,
    selectedChatId,
    handleBack,
    shouldShowChatList: !isMobile || !selectedChatId,
    shouldShowChatDetail: !isMobile || !!selectedChatId,
  };
};

// Re-export store hook for convenience
export { useWhatsAppStore };
