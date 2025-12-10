/**
 * Communications Feature Preview
 * 
 * Real UI preview showing the unified communications interface
 * with channels, DMs, and message area
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  MessageSquare,
  Hash,
  Users,
  Send,
  Smile,
  Paperclip,
  MoreHorizontal,
  Check,
  CheckCheck,
  Phone,
  Video,
  Plus,
  Search,
  Settings,
  Bell,
  Pin,
  ChevronDown,
  AtSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Channel {
  id: string
  name: string
  unread?: number
  muted?: boolean
  isPinned?: boolean
}

interface DirectMessage {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastMessage?: string
  unread?: number
}

interface Message {
  id: string
  sender: string
  avatar?: string
  content: string
  time: string
  isOwn: boolean
  status: 'sent' | 'delivered' | 'read'
}

interface CommunicationsMockData {
  channels: Channel[]
  directMessages: DirectMessage[]
  messages: Message[]
  selectedChannel: string
  workspaceName: string
}

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
}

function CommunicationsPreview({ mockData, compact, interactive, onInteraction }: FeaturePreviewProps) {
  const data = mockData.data as unknown as CommunicationsMockData
  const [inputValue, setInputValue] = useState('')
  const [selectedChannel, setSelectedChannel] = useState(data.selectedChannel)
  const [viewMode, setViewMode] = useState<'channels' | 'dms'>('channels')

  const handleSend = () => {
    if (inputValue.trim() && interactive) {
      onInteraction?.('send-message', { content: inputValue })
      setInputValue('')
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Communications</span>
          </div>
          <Badge variant="secondary">
            {data.channels.reduce((acc, c) => acc + (c.unread || 0), 0)} unread
          </Badge>
        </div>
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
    <div className="flex h-full border rounded-xl overflow-hidden bg-background">
      {/* Left Sidebar - Channels & DMs */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        {/* Workspace Header */}
        <div className="p-3 border-b">
          <Button variant="ghost" className="w-full justify-between h-auto py-2 px-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {data.workspaceName[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{data.workspaceName}</p>
                <p className="text-xs text-muted-foreground">12 members</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="p-2 border-b">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'channels' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => interactive && setViewMode('channels')}
              disabled={!interactive}
            >
              <Hash className="h-3 w-3 mr-1" />
              Channels
            </Button>
            <Button
              variant={viewMode === 'dms' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => interactive && setViewMode('dms')}
              disabled={!interactive}
            >
              <Users className="h-3 w-3 mr-1" />
              DMs
            </Button>
          </div>
        </div>

        {/* Channels/DMs List */}
        <ScrollArea className="flex-1">
          {viewMode === 'channels' ? (
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Channels</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={!interactive}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {data.channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-8 px-2 text-sm"
                  onClick={() => interactive && setSelectedChannel(channel.id)}
                  disabled={!interactive}
                >
                  <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{channel.name}</span>
                  {channel.unread && channel.unread > 0 && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                      {channel.unread}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={!interactive}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {data.directMessages.map((dm) => (
                <Button
                  key={dm.id}
                  variant="ghost"
                  className="w-full justify-start h-10 px-2"
                  disabled={!interactive}
                >
                  <div className="relative mr-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={dm.avatar} />
                      <AvatarFallback className="text-xs">{dm.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                      statusColors[dm.status]
                    )} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm truncate">{dm.name}</p>
                  </div>
                  {dm.unread && dm.unread > 0 && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                      {dm.unread}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-semibold text-sm">{data.channels.find(c => c.id === selectedChannel)?.name || 'general'}</h4>
              <p className="text-xs text-muted-foreground">3 members online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
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
                <div className={cn("flex flex-col max-w-[70%]", msg.isOwn && "items-end")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-2 rounded-lg",
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
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={!interactive}>
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              className="border-0 bg-transparent h-8 focus-visible:ring-0 px-0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!interactive}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={!interactive}>
              <AtSign className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={!interactive}>
              <Smile className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleSend} disabled={!interactive}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Info (simplified) */}
      <div className="w-64 border-l bg-muted/20 hidden lg:flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Channel Details</h3>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">About</h4>
              <p className="text-sm text-muted-foreground">General discussions and updates for the team.</p>
            </div>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Members (3)</h4>
              <div className="space-y-2">
                {['Alice', 'Bob', 'Charlie'].map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                        i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : 'bg-gray-400'
                      )} />
                    </div>
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'communications',
  name: 'Communications',
  description: 'Real-time messaging with channels, DMs, and calls',
  component: CommunicationsPreview,
  category: 'communication',
  tags: ['messaging', 'real-time', 'team', 'chat', 'channels', 'calls'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Team Communication',
      description: 'Active workspace with channels and DMs',
      data: {
        workspaceName: 'Acme Corp',
        selectedChannel: 'general',
        channels: [
          { id: 'general', name: 'general', unread: 3 },
          { id: 'engineering', name: 'engineering', unread: 0 },
          { id: 'design', name: 'design', unread: 1 },
          { id: 'marketing', name: 'marketing', unread: 0 },
          { id: 'random', name: 'random', unread: 5 },
        ],
        directMessages: [
          { id: '1', name: 'Alice Johnson', status: 'online', unread: 2 },
          { id: '2', name: 'Bob Smith', status: 'away', unread: 0 },
          { id: '3', name: 'Charlie Brown', status: 'online', unread: 0 },
          { id: '4', name: 'Diana Ross', status: 'offline', unread: 1 },
        ],
        messages: [
          { id: '1', sender: 'Alice', avatar: '', content: 'Hey team! How is the project going?', time: '10:30 AM', isOwn: false, status: 'read' },
          { id: '2', sender: 'You', avatar: '', content: 'Going great! Just finished the new feature.', time: '10:32 AM', isOwn: true, status: 'read' },
          { id: '3', sender: 'Bob', avatar: '', content: "That's awesome! Can't wait to see it in action 🎉", time: '10:33 AM', isOwn: false, status: 'read' },
          { id: '4', sender: 'You', avatar: '', content: 'I will demo it in our standup later today', time: '10:35 AM', isOwn: true, status: 'delivered' },
          { id: '5', sender: 'Alice', avatar: '', content: 'Perfect! Looking forward to it.', time: '10:36 AM', isOwn: false, status: 'read' },
        ],
      },
    },
  ],
})
