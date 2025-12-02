"use client"

import { Bot } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface AIChatListCardProps {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messageCount: number
  isActive?: boolean
  isGlobal?: boolean
  onClick?: () => void
}

/**
 * Dynamic card component for AI chat list items.
 * Provides consistent styling and flexible layout for chat previews.
 */
export function AIChatListCard({
  id,
  title,
  lastMessage,
  timestamp,
  messageCount,
  isActive = false,
  isGlobal = false,
  onClick,
}: AIChatListCardProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        isActive 
          ? "bg-accent border-primary/30 shadow-sm" 
          : "bg-card hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
          isGlobal 
            ? "bg-gradient-to-br from-purple-600 to-pink-600"
            : "bg-gradient-to-br from-blue-600 to-purple-600"
        )}>
          <Bot className="h-5 w-5 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-foreground truncate text-sm">
              {title}
            </h3>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timestamp}
            </span>
          </div>
          
          {/* Message Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {lastMessage}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {isGlobal && (
              <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">
                Private
              </span>
            )}
            {messageCount > 0 && (
              <span className={cn(
                "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full",
                isGlobal ? "ml-auto" : ""
              )}>
                {messageCount} msg{messageCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
