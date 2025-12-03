/**
 * AI Feature Preview
 * 
 * Mock preview showing the AI assistant interface
 */

"use client"

import * as React from 'react'
import { Bot, Sparkles, Send, Wand2, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIMockData {
  conversation: AIMessage[]
  suggestions: string[]
  capabilities: string[]
  model: string
}

function AIPreview({ mockData, compact, interactive, onInteraction }: FeaturePreviewProps) {
  const data = mockData.data as unknown as AIMockData
  const [inputValue, setInputValue] = React.useState('')

  const handleSend = () => {
    if (inputValue.trim() && interactive) {
      onInteraction?.('send-prompt', { content: inputValue })
      setInputValue('')
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-medium text-sm">AI Assistant</div>
          <div className="text-xs text-muted-foreground">Powered by {data.model}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[450px] border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-sm flex items-center gap-2">
              AI Assistant
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </h4>
            <p className="text-xs text-muted-foreground">Powered by {data.model}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {data.conversation.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' && "flex-row-reverse")}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={cn(
                  msg.role === 'assistant' 
                    ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white" 
                    : "bg-muted"
                )}>
                  {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "flex flex-col max-w-[280px]",
                msg.role === 'user' && "items-end"
              )}>
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm",
                  msg.role === 'assistant' 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      <div className="px-4 py-2 border-t bg-muted/30">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {data.suggestions.map((suggestion, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm" 
              className="text-xs whitespace-nowrap h-7 flex-shrink-0"
              disabled={!interactive}
              onClick={() => setInputValue(suggestion)}
            >
              <Wand2 className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask AI anything..."
            className="h-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!interactive}
          />
          <Button size="icon" className="h-10 w-10 flex-shrink-0" onClick={handleSend} disabled={!interactive}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Capabilities */}
      <div className="px-4 py-2 border-t bg-muted/20">
        <div className="flex flex-wrap gap-1">
          {data.capabilities.map((cap) => (
            <Badge key={cap} variant="secondary" className="text-[10px]">
              {cap}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'ai',
  name: 'AI Assistant',
  description: 'Intelligent AI-powered assistant',
  component: AIPreview,
  category: 'productivity',
  tags: ['ai', 'assistant', 'chat', 'automation'],
  mockDataSets: [
    {
      id: 'default',
      name: 'General Assistant',
      description: 'General purpose AI assistant',
      data: {
        model: 'GPT-4',
        conversation: [
          { id: '1', role: 'user', content: 'Help me write a project proposal', timestamp: '2 min ago' },
          { id: '2', role: 'assistant', content: 'I would be glad to help you write a project proposal! Could you tell me more about the project? What is the goal, who is the audience, and what key points should be covered?', timestamp: '2 min ago' },
          { id: '3', role: 'user', content: "It's for a new mobile app for task management", timestamp: '1 min ago' },
          { id: '4', role: 'assistant', content: "Great! Here's a structure for your proposal:\n\n1. **Executive Summary**\n2. **Problem Statement**\n3. **Proposed Solution**\n4. **Key Features**\n5. **Timeline & Budget**\n\nShall I expand on any section?", timestamp: 'Just now' },
        ],
        suggestions: ['Expand on features', 'Add timeline', 'Review grammar'],
        capabilities: ['Writing', 'Code', 'Analysis', 'Research'],
      },
    },
    {
      id: 'code',
      name: 'Code Assistant',
      description: 'AI assistant for coding tasks',
      data: {
        model: 'Claude 3.5',
        conversation: [
          { id: '1', role: 'user', content: 'How do I create a React custom hook?', timestamp: '5 min ago' },
          { id: '2', role: 'assistant', content: 'To create a custom hook in React, start with "use" prefix. Here is an example:\n\n```typescript\nfunction useCounter(initial = 0) {\n  const [count, setCount] = useState(initial);\n  const increment = () => setCount(c => c + 1);\n  return { count, increment };\n}\n```\n\nWould you like me to explain the pattern in more detail?', timestamp: '5 min ago' },
        ],
        suggestions: ['Explain useState', 'Show more examples', 'Best practices'],
        capabilities: ['Code Generation', 'Debugging', 'Refactoring', 'Documentation'],
      },
    },
  ],
})
