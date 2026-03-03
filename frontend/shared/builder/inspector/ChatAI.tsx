import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Send, Bot, User } from 'lucide-react';

interface ChatAIProps {
  selectedNode: any | null;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function ChatAI({ selectedNode }: ChatAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I can help you modify and improve your selected component. What would you like to do?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you want to "${input}". ${selectedNode ? `For the selected ${selectedNode.type} component, ` : ''}I'll help you implement this change. Let me analyze the component and suggest modifications.`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {selectedNode && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Selected Component</div>
          <div className="text-sm font-medium">{selectedNode.type}</div>
          <div className="text-xs text-muted-foreground">ID: {selectedNode.id}</div>
        </div>
      )}

      <div className="flex-1 mb-4 overflow-y-auto">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-primary-foreground" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedNode ? `Ask about the ${selectedNode.type} component...` : "Select a component to start chatting..."}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
