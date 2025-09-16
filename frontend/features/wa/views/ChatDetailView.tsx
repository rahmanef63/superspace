import { useInitializeWhatsApp, useMobileWhatsApp, useCurrentChat } from '../shared/hooks';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ComposerBar } from '../components/chat/ComposerBar';
import { TopBar } from '../components/navigation/TopBar';
import { MobileHeader } from '../components/navigation/MobileHeader';
import { useWhatsAppStore } from '../shared/stores';

export function ChatDetailView() {
  const { selectedChat, selectedChatId } = useCurrentChat();
  const { isMobile, handleBack } = useMobileWhatsApp();
  const { messages, sendMessage } = useWhatsAppStore();

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

  const chatMessages = messages[selectedChatId] || [];

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <MobileHeader
          title={selectedChat.name}
          subtitle="last seen recently"
          onBack={handleBack}
        />
        
        <div className="flex-1 overflow-y-auto p-4">
          {chatMessages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))}
        </div>
        
        <ComposerBar onSendMessage={(text) => sendMessage(selectedChatId, text)} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <TopBar 
        title={selectedChat.name}
        subtitle="last seen recently"
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
      </div>
      
      <ComposerBar onSendMessage={(text) => sendMessage(selectedChatId, text)} />
    </div>
  );
}
