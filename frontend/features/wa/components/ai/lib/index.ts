import type { AIMessage, AIConversation, AISettings } from "../types"

export class AIService {
  private baseUrl: string

  constructor(baseUrl = "/api/ai") {
    this.baseUrl = baseUrl
  }

  async sendMessage(message: string, conversationHistory: AIMessage[] = [], settings: AISettings): Promise<AIMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: conversationHistory,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        id: data.id || Date.now().toString(),
        text: data.message,
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: "text",
        metadata: data.metadata,
      }
    } catch (error) {
      console.error("AI Service error:", error)
      throw error
    }
  }

  async streamMessage(
    message: string,
    conversationHistory: AIMessage[] = [],
    settings: AISettings,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: conversationHistory,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") return

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                onChunk(parsed.content)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Stream error:", error)
      throw error
    }
  }
}

export class ConversationManager {
  private storageKey = "ai_conversations"

  saveConversations(conversations: AIConversation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error("Failed to save conversations:", error)
    }
  }

  loadConversations(): AIConversation[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load conversations:", error)
      return []
    }
  }

  exportConversations(): string {
    const conversations = this.loadConversations()
    return JSON.stringify(conversations, null, 2)
  }

  importConversations(data: string): AIConversation[] {
    try {
      const conversations = JSON.parse(data)
      this.saveConversations(conversations)
      return conversations
    } catch (error) {
      console.error("Failed to import conversations:", error)
      throw new Error("Invalid conversation data")
    }
  }

  clearAllConversations(): void {
    localStorage.removeItem(this.storageKey)
  }
}

export const aiService = new AIService()
export const conversationManager = new ConversationManager()
