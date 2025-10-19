import type { AIConversation } from "../types"

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (diffInHours < 48) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString()
  }
}

export const truncateText = (text: string, maxLength = 50): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const extractTopicFromMessage = (message: string): string => {
  const keywords = {
    Programming: ["code", "javascript", "python", "react", "api", "function", "variable"],
    Cooking: ["recipe", "cook", "ingredient", "food", "meal", "kitchen"],
    Travel: ["travel", "trip", "vacation", "hotel", "flight", "destination"],
    Fitness: ["workout", "exercise", "gym", "fitness", "health", "training"],
    Education: ["learn", "study", "school", "university", "course", "education"],
    Business: ["business", "marketing", "sales", "strategy", "company", "profit"],
    Creative: ["design", "art", "creative", "writing", "music", "drawing"],
  }

  const lowerMessage = message.toLowerCase()

  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerMessage.includes(word))) {
      return topic
    }
  }

  return "General"
}

export const generateConversationTitle = (firstMessage: string): string => {
  const words = firstMessage.split(" ").slice(0, 6)
  return words.join(" ") + (firstMessage.split(" ").length > 6 ? "..." : "")
}

export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  if (!message.trim()) {
    return { isValid: false, error: "Message cannot be empty" }
  }

  if (message.length > 4000) {
    return { isValid: false, error: "Message is too long (max 4000 characters)" }
  }

  return { isValid: true }
}

export const searchConversations = (conversations: AIConversation[], query: string): AIConversation[] => {
  if (!query.trim()) return conversations

  const lowerQuery = query.toLowerCase()

  return conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.topic.toLowerCase().includes(lowerQuery) ||
      conv.messages.some((msg) => msg.text.toLowerCase().includes(lowerQuery)),
  )
}
