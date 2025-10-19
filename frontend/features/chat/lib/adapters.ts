export interface ChatAdapter {
  id: string
  name: string
  lastMessage: string
  timestamp: number
  unreadCount: number
  isOnline: boolean
  avatar?: string
}

export interface MessageAdapter {
  id: string
  chatId: string
  content: string
  timestamp: number
  senderId: string
  type: "text" | "image" | "file" | "audio"
  status: "sent" | "delivered" | "read"
}

export const adaptChatData = (rawData: any): ChatAdapter => {
  return {
    id: rawData.id || rawData._id,
    name: rawData.name || rawData.title,
    lastMessage: rawData.lastMessage?.content || "",
    timestamp: rawData.updatedAt || rawData.timestamp || Date.now(),
    unreadCount: rawData.unreadCount || 0,
    isOnline: rawData.isOnline || false,
    avatar: rawData.avatar || rawData.profileImage,
  }
}
