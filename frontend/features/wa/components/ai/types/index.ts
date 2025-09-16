export interface AIMessage {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: string
  type?: "text" | "image" | "file"
  metadata?: Record<string, any>
}

export interface AIConversation {
  id: string
  title: string
  topic: string
  messages: AIMessage[]
  createdAt: string
  updatedAt: string
  model?: string
  settings?: AISettings
}

export interface AISettings {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
}

export interface AIProvider {
  id: string
  name: string
  models: string[]
  isAvailable: boolean
}

export interface AIListViewProps {
  selectedChatId?: string
  onChatSelect?: (chatId: string) => void
  conversations?: AIConversation[]
  onNewChat?: () => void
}

export interface AIDetailViewProps {
  chatId?: string
  conversation?: AIConversation
  onSendMessage?: (message: string) => void
  isLoading?: boolean
}

export interface AIInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

export interface AIMessageProps {
  message: AIMessage
  isLast?: boolean
  onRegenerate?: () => void
  onCopy?: () => void
}
