/**
 * AI Feature Preview
 * 
 * Uses the REAL AIView layout structure with mock data
 * to show an authentic AI assistant experience
 */

"use client"

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Sparkles,
  Plus,
  Send,
  Brain,
  BookOpen,
  Lightbulb,
  Wand2,
  Clock,
  MoreHorizontal,
  Mic,
  Paperclip,
  StopCircle,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface AISession {
  id: string
  title: string
  updatedAt: string
  messageCount: number
  isActive?: boolean
}

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIMockData {
  sessions: AISession[]
  selectedSessionId: string | null
  messages: AIMessage[]
  capabilities: string[]
  suggestions: string[]
}

function AIPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as AIMockData
  const [selectedSessionId, setSelectedSessionId] = useState(data.selectedSessionId)
  const [inputValue, setInputValue] = useState('')
  const [knowledgeEnabled, setKnowledgeEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedSession = data.sessions.find(s => s.id === selectedSessionId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data.messages])

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <Badge variant="secondary">{data.sessions.length} chats</Badge>
        </div>
        <div className="space-y-2">
          {data.messages.slice(-2).map((msg) => (
            <div key={msg.id} className={cn("flex gap-2", msg.role === 'user' && "justify-end")}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              )}
              <div className={cn(
                "px-2 py-1 rounded-lg text-xs max-w-[85%]",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {msg.content.slice(0, 80)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-background">
      {/* Left Panel - Session List */}
      <div className="w-72 border-r bg-muted/20 flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Sessions</span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" disabled={!interactive}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button className="w-full gap-2" disabled={!interactive}>
            <Sparkles className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {data.sessions.map((session) => (
              <button
                key={session.id}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors group",
                  selectedSessionId === session.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                )}
                onClick={() => interactive && setSelectedSessionId(session.id)}
                disabled={!interactive}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  selectedSessionId === session.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-muted"
                )}>
                  <Bot className={cn(
                    "h-4 w-4",
                    selectedSessionId === session.id ? "text-white" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {session.messageCount} messages • {session.updatedAt}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  disabled={!interactive}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{selectedSession.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedSession.messageCount} messages</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-3xl mx-auto">
                {data.messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex gap-3",
                    msg.role === 'user' && "flex-row-reverse"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "flex-1 max-w-[80%]",
                      msg.role === 'user' && "flex flex-col items-end"
                    )}>
                      <div className={cn(
                        "rounded-lg px-4 py-3",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 mt-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2 max-w-3xl mx-auto bg-muted/50 rounded-lg px-3 py-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={!interactive}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Ask anything..."
                  className="border-0 bg-transparent h-8 focus-visible:ring-0 px-0"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={!interactive}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={!interactive}>
                  <Mic className="h-4 w-4" />
                </Button>
                <Button size="icon" className="h-8 w-8 flex-shrink-0" disabled={!interactive || !inputValue}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
              <p className="text-muted-foreground mb-6">
                Start a conversation with AI to get help with your work
              </p>
              <div className="grid gap-2">
                {data.suggestions.slice(0, 3).map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start h-auto py-3 text-left"
                    disabled={!interactive}
                  >
                    <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                    <span className="truncate">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Session Info */}
      {selectedSession && (
        <div className="w-72 border-l bg-muted/10 flex flex-col hidden lg:flex">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Session Info</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Knowledge Base Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <Label htmlFor="knowledge" className="text-sm font-medium">Knowledge Base</Label>
                </div>
                <Switch
                  id="knowledge"
                  checked={knowledgeEnabled}
                  onCheckedChange={(checked) => interactive && setKnowledgeEnabled(checked)}
                  disabled={!interactive}
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-4">
                Enable to search your documents and files
              </p>

              <Separator />

              {/* Capabilities */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Capabilities</h4>
                <div className="space-y-2">
                  {data.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Wand2 className="h-3 w-3 text-primary" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Session Stats */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium">{selectedSession.messageCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last active</span>
                    <span className="font-medium">{selectedSession.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'ai',
  name: 'AI Assistant',
  description: 'Intelligent AI-powered assistant for your workspace',
  component: AIPreview,
  category: 'productivity',
  tags: ['ai', 'assistant', 'chat', 'automation', 'help'],
  mockDataSets: [
    {
      id: 'default',
      name: 'AI Chat',
      description: 'Active AI conversation',
      data: {
        selectedSessionId: 'session-1',
        sessions: [
          { id: 'session-1', title: 'Project Planning Help', updatedAt: '2 hours ago', messageCount: 12 },
          { id: 'session-2', title: 'Code Review', updatedAt: 'Yesterday', messageCount: 8 },
          { id: 'session-3', title: 'Documentation Help', updatedAt: '3 days ago', messageCount: 5 },
          { id: 'session-4', title: 'Bug Analysis', updatedAt: '1 week ago', messageCount: 15 },
        ],
        messages: [
          { id: '1', role: 'user', content: 'Can you help me plan the roadmap for Q1?', timestamp: '10:30 AM' },
          { id: '2', role: 'assistant', content: 'Of course! I\'d be happy to help you plan your Q1 roadmap. To get started, could you share:\n\n1. What are your main business objectives for Q1?\n2. What resources (team size, budget) do you have available?\n3. Are there any hard deadlines or dependencies I should know about?\n\nThis will help me provide more tailored recommendations.', timestamp: '10:31 AM' },
          { id: '3', role: 'user', content: 'Our main goal is to launch the new feature set we\'ve been working on. We have a team of 8 engineers and the deadline is end of March.', timestamp: '10:33 AM' },
          { id: '4', role: 'assistant', content: 'Great! Based on your goals and timeline, here\'s a suggested Q1 roadmap structure:\n\n**January (Weeks 1-4):**\n• Complete core feature development\n• Begin internal testing\n• Set up monitoring infrastructure\n\n**February (Weeks 5-8):**\n• Beta testing with select users\n• Iterate based on feedback\n• Documentation and training materials\n\n**March (Weeks 9-12):**\n• Final QA and performance testing\n• Gradual rollout\n• Launch and post-launch support\n\nWould you like me to break down any of these phases in more detail?', timestamp: '10:35 AM' },
        ],
        capabilities: [
          'Answer questions',
          'Generate content',
          'Analyze documents',
          'Code assistance',
          'Task planning',
        ],
        suggestions: [
          'Help me write a project proposal',
          'Analyze this month\'s performance data',
          'Create a meeting agenda template',
        ],
      },
    },
  ],
})
