export interface AIMessageData {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: string
  type?: "text" | "image" | "file"
  metadata?: Record<string, any>
}

export type KnowledgeSourceType = string;

export interface AIConversation {
  id: string
  title: string
  topic: string
  messages: AIMessageData[]
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

export interface AgentDefinition {
  name: string
  description: string
  icon: string
  capabilities?: string[]
  prompts?: {
    system?: string
    [key: string]: any
  }
}
