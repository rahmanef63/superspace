import { useInitializeChat, useMobileWhatsApp, useCurrentChat } from '../../shared/hooks';
import { MessageBubble } from './MessageBubble';
import { ComposerBar } from './ComposerBar';
import { TopBar } from '../navigation/TopBar';
import { MobileHeader } from '../navigation/MobileHeader';
import { useWhatsAppStore } from '../../shared/stores';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Message } from '../../shared/types/core';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, X, Forward, Trash2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ChatDetailView() {
  const { selectedChat, selectedChatId } = useCurrentChat();
  const { isMobile, handleBack } = useMobileWhatsApp();
  // Use individual selectors to prevent unnecessary re-renders
  const messages = useWhatsAppStore((s) => s.messages);
  const sendMessage = useWhatsAppStore((s) => s.sendMessage);
  const markAsRead = useWhatsAppStore((s) => s.markAsRead);
  const loadMessages = useWhatsAppStore((s) => s.loadMessages);

  // Selection mode state for forward/delete multiple messages
  // IMPORTANT: All hooks must be called before any early returns
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  // Reply state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Message mutations (if available)
  const editMessageMutation = useMutation(api.features.chat.messages.editMessage);
  const deleteMessageMutation = useMutation(api.features.chat.messages.deleteMessage);

  // Live messages from Convex (preferred). Fallback to store when undefined/loading.
  const currentUser = useQuery(api.auth.auth.loggedInUser);
  const live = useQuery(
    (api as any)["features/chat/messages"].getConversationMessages,
    selectedChatId ? ({ conversationId: selectedChatId as unknown as Id<'conversations'>, limit: 100 } as any) : 'skip'
  ) as any[] | undefined;
  const liveMessages: Message[] | undefined = useMemo(() => {
    if (!live) return undefined;
    const meId = String((currentUser as any)?._id || '');
    return (live as any[]).map((m: any): Message => {
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
        type: ((m?.type as Message['type']) || 'text'),
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
  const chatMessages: Message[] = liveMessages ?? (selectedChatId ? (messages[selectedChatId] || []) : []);

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

  const handleToggleSelection = useCallback((messageId: string, selected: boolean) => {
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(messageId);
      } else {
        next.delete(messageId);
      }
      return next;
    });
  }, []);

  const handleExitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedMessages.size === 0) return;
    
    const confirmed = confirm(`Delete ${selectedMessages.size} message(s)?`);
    if (!confirmed) return;

    try {
      for (const msgId of selectedMessages) {
        await deleteMessageMutation({
          messageId: msgId as Id<"messages">,
        });
      }
      toast.success(`Deleted ${selectedMessages.size} message(s)`);
      handleExitSelectionMode();
    } catch (e) {
      console.error("Failed to delete messages:", e);
      toast.error("Failed to delete messages");
    }
  }, [selectedMessages, deleteMessageMutation, handleExitSelectionMode]);

  const handleForwardSelected = useCallback(() => {
    if (selectedMessages.size === 0) return;
    toast.info(`Forward ${selectedMessages.size} message(s) - Coming soon!`);
    // TODO: Open forward dialog with selected messages
    handleExitSelectionMode();
  }, [selectedMessages, handleExitSelectionMode]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      await editMessageMutation({
        messageId: messageId as Id<"messages">,
        content: newText,
      });
    } catch (e) {
      console.error("Failed to edit message:", e);
      toast.error("Failed to edit message");
    }
  }, [editMessageMutation]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessageMutation({
        messageId: messageId as Id<"messages">,
      });
    } catch (e) {
      console.error("Failed to delete message:", e);
      toast.error("Failed to delete message");
    }
  }, [deleteMessageMutation]);

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleForwardMessage = useCallback((message: Message) => {
    toast.info("Forward message - Coming soon!");
    // TODO: Open forward dialog
  }, []);

  // Create contact object for member info modal
  const chatContact = useMemo(() => ({
    id: selectedChat?.id || '',
    name: selectedChat?.name || '',
    avatar: selectedChat?.avatar,
  }), [selectedChat]);

  // Determine if user is a participant in the selected chat using store data (best effort)
  const meId = String((currentUser as any)?._id || '');
  const notParticipant = Boolean(selectedChat?.participants && meId && !selectedChat.participants?.includes(meId));

  // Get workspace color for read indicators (from workspace context if available)
  const workspaceColor = "#6366f1"; // Default indigo, could be fetched from workspace context
  const isPublicChat = Boolean((selectedChat as any)?.isPublic);

  // Early return AFTER all hooks are called
  if (!selectedChatId || !selectedChat) {
    if (isMobile) {
      return null;
    }
    
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Chats Clone</p>
          <p className="text-sm mt-2">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-background">
        <MobileHeader
          title={selectedChat.name}
          subtitle="last seen recently"
          avatar={selectedChat.avatar}
          onBack={handleBack}
          contact={chatContact}
        />
        
        {/* Selection Mode Toolbar */}
        {selectionMode && (
          <div className="flex items-center justify-between px-4 py-2 bg-accent border-b">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleExitSelectionMode}>
                <X className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">
                {selectedMessages.size} selected
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleForwardSelected}
                disabled={selectedMessages.size === 0}
              >
                <Forward className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDeleteSelected}
                disabled={selectedMessages.size === 0}
                className="text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Reply Preview */}
        {replyingTo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Replying to</p>
              <p className="text-sm truncate">{replyingTo.text}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancelReply}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
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
            <MessageBubble 
              key={message.id} 
              {...message}
              workspaceColor={workspaceColor}
              isPublic={isPublicChat}
              selectionMode={selectionMode}
              isSelected={selectedMessages.has(message.id)}
              onSelectionChange={(selected) => handleToggleSelection(message.id, selected)}
              onReply={() => handleReply(message)}
              onForward={() => handleForwardMessage(message)}
              onEdit={message.variant === 'sent' ? (newText) => handleEditMessage(message.id, newText) : undefined}
              onDelete={message.variant === 'sent' ? () => handleDeleteMessage(message.id) : undefined}
              onReact={(emoji) => toast.success(`Reacted with ${emoji}`)}
            />
          ))}
        </div>
        
        <div className="flex-none safe-area-bottom">
          {/* Long press hint for selection mode */}
          {!selectionMode && (
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground mb-1"
                onClick={() => setSelectionMode(true)}
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                Select messages
              </Button>
            </div>
          )}
          <ComposerBar
            onSendMessage={(text) => {
              sendMessage(selectedChatId, text);
              setReplyingTo(null);
            }}
            disabled={notParticipant}
            disabledReason={notParticipant ? "You are not a participant" : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <TopBar 
        title={selectedChat.name}
        subtitle="last seen recently"
        contact={chatContact}
      />

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <div className="flex items-center justify-between px-4 py-2 bg-accent border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleExitSelectionMode}>
              <X className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">
              {selectedMessages.size} selected
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleForwardSelected}
              disabled={selectedMessages.size === 0}
            >
              <Forward className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDeleteSelected}
              disabled={selectedMessages.size === 0}
              className="text-destructive"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Replying to</p>
            <p className="text-sm truncate">{replyingTo.text}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
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
          <MessageBubble 
            key={message.id} 
            {...message}
            workspaceColor={workspaceColor}
            isPublic={isPublicChat}
            selectionMode={selectionMode}
            isSelected={selectedMessages.has(message.id)}
            onSelectionChange={(selected) => handleToggleSelection(message.id, selected)}
            onReply={() => handleReply(message)}
            onForward={() => handleForwardMessage(message)}
            onEdit={message.variant === 'sent' ? (newText) => handleEditMessage(message.id, newText) : undefined}
            onDelete={message.variant === 'sent' ? () => handleDeleteMessage(message.id) : undefined}
            onReact={(emoji) => toast.success(`Reacted with ${emoji}`)}
          />
        ))}
      </div>
      
      <div className="flex-none">
        {/* Selection mode toggle */}
        {!selectionMode && (
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground mb-1"
              onClick={() => setSelectionMode(true)}
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              Select messages
            </Button>
          </div>
        )}
        <ComposerBar
          onSendMessage={(text) => {
            sendMessage(selectedChatId, text);
            setReplyingTo(null);
          }}
          disabled={notParticipant}
          disabledReason={notParticipant ? "You are not a participant" : undefined}
        />
      </div>
    </div>
  );
}
