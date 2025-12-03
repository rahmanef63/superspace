/**
 * Chat Feature Preview
 * 
 * Mock preview showing the chat/messaging interface
 */

"use client"

import * as React from 'react'
import { Send, Smile, Paperclip, MoreHorizontal, Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Message {
  id: string
  sender: string
  avatar: string
  content: string
  time: string
  isOwn: boolean
  status: 'sent' | 'delivered' | 'read'
}

interface ChatMockData {
  channelName: string
  messages: Message[]
  typing?: string[]
}

function ChatPreview({ mockData, compact, interactive, onInteraction }: FeaturePreviewProps) {
  const data = mockData.data as unknown as ChatMockData
  const [inputValue, setInputValue] = React.useState('')

  const handleSend = () => {
    if (inputValue.trim() && interactive) {
      onInteraction?.('send-message', { content: inputValue })
      setInputValue('')
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {data.messages.slice(-3).map((msg) => (
          <div key={msg.id} className={cn("flex gap-2", msg.isOwn && "justify-end")}>
            {!msg.isOwn && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{msg.sender[0]}</AvatarFallback>
              </Avatar>
            )}
            <div className={cn(
              "px-2 py-1 rounded-lg text-xs max-w-[80%]",
              msg.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium">#</span>
          </div>
          <div>
            <h4 className="font-medium text-sm">{data.channelName}</h4>
            <p className="text-xs text-muted-foreground">
              {data.typing?.length ? `${data.typing.join(', ')} typing...` : '3 members online'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {data.messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.isOwn && "flex-row-reverse")}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback>{msg.sender[0]}</AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col", msg.isOwn && "items-end")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.sender}</span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <div className={cn(
                  "px-3 py-2 rounded-lg max-w-[280px]",
                  msg.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.isOwn && (
                  <div className="flex items-center mt-1">
                    {msg.status === 'read' ? (
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    ) : (
                      <Check className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            className="h-9"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!interactive}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Smile className="h-4 w-4" />
          </Button>
          <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleSend} disabled={!interactive}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'chat',
  name: 'Chat',
  description: 'Real-time messaging and team communication',
  component: ChatPreview,
  category: 'communication',
  tags: ['messaging', 'real-time', 'team'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Team Discussion',
      description: 'Active team conversation',
      data: {
        channelName: 'general',
        messages: [
          { id: '1', sender: 'Alice', avatar: '', content: 'Hey team! How is the project going?', time: '10:30 AM', isOwn: false, status: 'read' },
          { id: '2', sender: 'You', avatar: '', content: 'Going great! Just finished the new feature.', time: '10:32 AM', isOwn: true, status: 'read' },
          { id: '3', sender: 'Bob', avatar: '', content: "That's awesome! Can't wait to see it in action 🎉", time: '10:33 AM', isOwn: false, status: 'read' },
          { id: '4', sender: 'You', avatar: '', content: 'I will demo it in our standup later today', time: '10:35 AM', isOwn: true, status: 'delivered' },
        ],
        typing: ['Alice'],
      },
    },
    {
      id: 'support',
      name: 'Support Channel',
      description: 'Customer support conversation',
      data: {
        channelName: 'support-tickets',
        messages: [
          { id: '1', sender: 'Customer', avatar: '', content: 'Hi, I need help with my account settings', time: '2:15 PM', isOwn: false, status: 'read' },
          { id: '2', sender: 'You', avatar: '', content: 'Hi! I would be happy to help. What seems to be the issue?', time: '2:16 PM', isOwn: true, status: 'read' },
          { id: '3', sender: 'Customer', avatar: '', content: 'I cannot find where to change my password', time: '2:17 PM', isOwn: false, status: 'read' },
          { id: '4', sender: 'You', avatar: '', content: 'Go to Settings > Security > Change Password. Let me know if you need more help!', time: '2:18 PM', isOwn: true, status: 'read' },
        ],
      },
    },
  ],
})
