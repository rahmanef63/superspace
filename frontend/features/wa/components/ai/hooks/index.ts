"use client"

import { useState, useCallback } from "react"
import type { AIConversation, AIMessage, AISettings } from "../types"
import { generateId, generateConversationTitle, extractTopicFromMessage } from "../utils"
import { DEFAULT_AI_SETTINGS } from "../constants"

export const useAIConversations = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const createNewConversation = useCallback((firstMessage?: string): string => {
    const id = generateId()
    const title = firstMessage ? generateConversationTitle(firstMessage) : "New Conversation"
    const topic = firstMessage ? extractTopicFromMessage(firstMessage) : "General"

    const newConversation: AIConversation = {
      id,
      title,
      topic,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: DEFAULT_AI_SETTINGS,
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedChatId(id)

    return id
  }, [])

  const addMessage = useCallback((conversationId: string, message: AIMessage) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : conv,
      ),
    )
  }, [])

  const updateConversation = useCallback((conversationId: string, updates: Partial<AIConversation>) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates, updatedAt: new Date().toISOString() } : conv,
      ),
    )
  }, [])

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      if (selectedChatId === conversationId) {
        setSelectedChatId(undefined)
      }
    },
    [selectedChatId],
  )

  const selectedConversation = conversations.find((conv) => conv.id === selectedChatId)

  return {
    conversations,
    selectedChatId,
    selectedConversation,
    isLoading,
    setSelectedChatId,
    setIsLoading,
    createNewConversation,
    addMessage,
    updateConversation,
    deleteConversation,
  }
}

export const useAIChat = (conversationId?: string) => {
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string, onAddMessage: (message: AIMessage) => void, settings?: AISettings) => {
      if (!conversationId) return

      setIsTyping(true)
      setError(null)

      // Add user message
      const userMessage: AIMessage = {
        id: generateId(),
        text: message,
        sender: "user",
        timestamp: new Date().toISOString(),
        type: "text",
      }

      onAddMessage(userMessage)

      try {
        // Simulate AI response (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        const aiMessage: AIMessage = {
          id: generateId(),
          text: `This is a simulated AI response to: "${message}". In a real implementation, this would be replaced with actual AI API calls.`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        }

        onAddMessage(aiMessage)
      } catch (err) {
        setError("Failed to get AI response. Please try again.")
        console.error("AI chat error:", err)
      } finally {
        setIsTyping(false)
      }
    },
    [conversationId],
  )

  return {
    sendMessage,
    isTyping,
    error,
    clearError: () => setError(null),
  }
}

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)

  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AI_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
