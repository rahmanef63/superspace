// Custom hooks for Chats Clone feature
import { useEffect, useRef } from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { useWhatsAppStore } from '../stores';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConvex } from 'convex/react';
import { useWorkspaceContext } from '@/app/dashboard/WorkspaceProvider';
import { ConvexChatRepository } from '../data/adapters/convex.adapter';

// Hook to initialize Chats data
export const useInitializeWhatsApp = (providedWorkspaceId?: Id<"workspaces"> | null) => {
  const convex = useConvex();
  const { workspaceId: contextWorkspaceId } = useWorkspaceContext();
  const init = useWhatsAppStore((s) => s.init);
  const loadChats = useWhatsAppStore((s) => s.loadChats);

  const effectiveWorkspaceId = (providedWorkspaceId ?? (contextWorkspaceId as Id<"workspaces"> | null)) || null;

  const initializedWorkspaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!convex || !effectiveWorkspaceId) return;
    const key = String(effectiveWorkspaceId);
    if (initializedWorkspaceRef.current === key) return;

    const repo = new ConvexChatRepository({ client: convex as any, workspaceId: effectiveWorkspaceId as any });
    init(repo, key);
    loadChats();
    initializedWorkspaceRef.current = key;
  }, [convex, effectiveWorkspaceId, init, loadChats]);
};

// Hook to get current chat data
export const useCurrentChat = () => {
  const { chats, selectedChatId } = useWhatsAppStore();
  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  
  return { selectedChat, selectedChatId };
};

// Hook to handle mobile-specific Chats behavior
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
