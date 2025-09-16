export interface Chat {
  id: string
  name: string
  type: "individual" | "group"
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  isMuted: boolean
  createdAt: number
  updatedAt: number
  avatar?: string
  description?: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: "text" | "image" | "file" | "audio" | "video" | "location"
  timestamp: number
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  replyTo?: string
  reactions?: MessageReaction[]
  metadata?: MessageMetadata
}

export interface MessageReaction {
  emoji: string
  userId: string
  timestamp: number
}

export interface MessageMetadata {
  fileName?: string
  fileSize?: number
  duration?: number
  dimensions?: { width: number; height: number }
  location?: { lat: number; lng: number; address?: string }
}
