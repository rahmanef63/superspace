"use client"

import type React from "react"

import { useState } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AIInputProps } from "../types"
import { validateMessage } from "../utils"
import { MAX_MESSAGE_LENGTH } from "../constants"

export function AIInput({
  onSendMessage,
  disabled = false,
  placeholder = "Ask AI anything...",
  maxLength = MAX_MESSAGE_LENGTH,
}: AIInputProps) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSend = () => {
    const validation = validateMessage(message)

    if (!validation.isValid) {
      setError(validation.error || "Invalid message")
      return
    }

    onSendMessage(message.trim())
    setMessage("")
    setError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    if (error) setError(null)

    if (value.length > maxLength) {
      setError(`Message too long (${value.length}/${maxLength})`)
    }
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-destructive px-1">{error}</div>}

      <div className="flex gap-2">
        <Button variant="ghost" size="icon" disabled={disabled} className="text-muted-foreground hover:text-foreground">
          <Paperclip className="h-4 w-4" />
        </Button>

        <Input
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
          maxLength={maxLength}
        />

        <Button onClick={handleSend} disabled={disabled || !message.trim() || !!error} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-right">
        {message.length}/{maxLength}
      </div>
    </div>
  )
}
