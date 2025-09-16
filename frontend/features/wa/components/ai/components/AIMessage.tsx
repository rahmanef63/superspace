"use client"

import { useState } from "react"
import { Copy, RotateCcw, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AIMessageProps } from "../types"
import { formatTimestamp } from "../utils"

export function AIMessage({ message, isLast = false, onRegenerate, onCopy }: AIMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const isUser = message.sender === "user"
  const isAI = message.sender === "ai"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <Card className={`p-3 ${isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}>
          <div className="whitespace-pre-wrap break-words">{message.text}</div>

          {/* Message Actions */}
          <div className={`flex items-center gap-1 mt-2 ${isUser ? "justify-start" : "justify-between"}`}>
            <span className={`text-xs ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {formatTimestamp(message.timestamp)}
            </span>

            {!isUser && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3 w-3" />
                </Button>

                {isLast && onRegenerate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {copied && <div className="text-xs text-muted-foreground mt-1">Copied to clipboard</div>}
      </div>
    </div>
  )
}
