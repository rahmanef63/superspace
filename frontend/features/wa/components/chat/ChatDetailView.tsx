import { useInitializeWhatsApp, useMobileWhatsApp, useCurrentChat } from '../../shared/hooks';
import { MessageBubble } from './MessageBubble';
import { ComposerBar } from './ComposerBar';
import { TopBar } from '../navigation/TopBar';
import { MobileHeader } from '../navigation/MobileHeader';
import { useWhatsAppStore } from '../../shared/stores';
import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Message as UiMessage } from '../../shared/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export function ChatDetailView() {
  const { selectedChat, selectedChatId } = useCurrentChat();
  const { isMobile, handleBack } = useMobileWhatsApp();
  const { messages, sendMessage } = useWhatsAppStore();
  const markAsRead = useWhatsAppStore((s) => s.markAsRead);
  const loadMessages = useWhatsAppStore((s) => s.loadMessages);

  // Live messages from Convex (preferred). Fallback to store when undefined/loading.
  const currentUser = useQuery(api.auth.auth.loggedInUser);
  const live = useQuery(
    api.menu.chat.messages.getConversationMessages as any,
    selectedChatId ? ({ conversationId: selectedChatId as unknown as Id<'conversations'>, limit: 100 } as any) : 'skip'
  ) as any[] | undefined;
  const liveMessages: UiMessage[] | undefined = useMemo(() => {
    if (!live) return undefined;
    const meId = String((currentUser as any)?._id || '');
    return (live as any[]).map((m: any): UiMessage => {
      const ts: number | undefined = (m as any)?._creationTime;
      let when = '';
      if (typeof ts === 'number' && ts > 0) {
        try {
          when = new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch {}
      }
      const mine = String(m?.senderId || '') === meId;
      return {
        id: String(m?._id || ''),
        text: String(m?.content || ''),
        timestamp: when,
        variant: (mine ? 'sent' : 'received'),
        type: ((m?.type as UiMessage['type']) || 'text'),
        // Default to not-read for old messages without explicit status
        status: mine ? 'sent' : undefined,
      };
    });
  }, [live, currentUser]);

  // Load messages once per chat selection for fallback store data
  useEffect(() => {
    if (!selectedChatId) return;
    loadMessages(selectedChatId).catch(() => {});
    // keep deps minimal to avoid re-runs on stable function identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  // Resolve messages for UI (live preferred)
  const chatMessages: UiMessage[] = liveMessages ?? (selectedChatId ? (messages[selectedChatId] || []) : []);

  // Mark as read only when the last received message id changes for this chat
  const lastReceivedId = useMemo(() => {
    const last = [...chatMessages].filter((m) => m.variant === 'received').pop();
    return last?.id || null;
  }, [chatMessages]);

  const lastMarkedRef = useRef<Record<string, string | null>>({});
  useEffect(() => {
    if (!selectedChatId || !lastReceivedId) return;
    const prev = lastMarkedRef.current[selectedChatId];
    if (prev === lastReceivedId) return;
    lastMarkedRef.current[selectedChatId] = lastReceivedId;
    markAsRead(selectedChatId, lastReceivedId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId, lastReceivedId]);

  if (!selectedChatId || !selectedChat) {
    if (isMobile) {
      return null;
    }
    
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">WhatsApp Clone</p>
          <p className="text-sm mt-2">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  // Determine if user is a participant in the selected chat using store data (best effort)
  const meId = String((currentUser as any)?._id || '');
  const notParticipant = Boolean(selectedChat?.participants && meId && !selectedChat.participants?.includes(meId));

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <MobileHeader
          title={selectedChat.name}
          subtitle="last seen recently"
          onBack={handleBack}
        />
        
        <div className="flex-1 overflow-y-auto p-4">
          {notParticipant && (
            <Alert variant="destructive" className="mb-3">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>No access to this conversation</AlertTitle>
              <AlertDescription>
                You are not a participant of this conversation. You can view limited info but cannot send messages.
              </AlertDescription>
            </Alert>
          )}
          {chatMessages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))}
        </div>
        
        <ComposerBar
          onSendMessage={(text) => sendMessage(selectedChatId, text)}
          disabled={notParticipant}
          disabledReason={notParticipant ? "You are not a participant" : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar 
        title={selectedChat.name}
        subtitle="last seen recently"
        contact={{
          id: selectedChat.id,
          name: selectedChat.name,
          avatar: selectedChat.avatar,
        }}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        {notParticipant && (
          <Alert variant="destructive" className="mb-3">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>No access to this conversation</AlertTitle>
            <AlertDescription>
              You are not a participant of this conversation. You can view limited info but cannot send messages.
            </AlertDescription>
          </Alert>
        )}
        {chatMessages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
      </div>
      
      <ComposerBar
        onSendMessage={(text) => sendMessage(selectedChatId, text)}
        disabled={notParticipant}
        disabledReason={notParticipant ? "You are not a participant" : undefined}
      />
    </div>
  );
}
