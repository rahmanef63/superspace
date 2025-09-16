export * from "./media"
export * from "./messages"
export * from "./navigation"

// Legacy constants
import { MessageCircle, Phone, Camera, Bot, Settings, Star, Archive } from "lucide-react"
import type { TabType } from "../types"

export const RAIL_ITEMS = [
  { id: "chats" as TabType, icon: MessageCircle, label: "Chats" },
  { id: "calls" as TabType, icon: Phone, label: "Calls" },
  { id: "status" as TabType, icon: Camera, label: "Status" },
  { id: "ai" as TabType, icon: Bot, label: "Meta AI" },
  { id: "starred" as TabType, icon: Star, label: "Starred messages" },
  { id: "archived" as TabType, icon: Archive, label: "Archived chats" },
  { id: "settings" as TabType, icon: Settings, label: "Settings" },
]

export const DEFAULT_TAB: TabType = "chats"

export const MESSAGE_STATUS_TIMEOUT = {
  SENT: 1000,
  DELIVERED: 2000,
}

export const PLACEHOLDERS = {
  SEARCH_CHATS: "Search or start a new chat",
  SEARCH_ARCHIVED: "Search archived chats",
  TYPE_MESSAGE: "Type a message",
}

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const

export const APP_CONFIG = {
  name: "WhatsApp Clone",
  version: "1.0.0",
  defaultTab: "chats" as TabType,

  sidebar: {
    width: 320,
    collapsedWidth: 72,
  },

  message: {
    maxLength: 4096,
    statusTimeout: {
      sent: 1000,
      delivered: 2000,
    },
  },

  media: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: {
      image: ["jpg", "jpeg", "png", "gif", "webp"],
      video: ["mp4", "mov", "avi", "mkv"],
      audio: ["mp3", "wav", "ogg", "m4a"],
      document: ["pdf", "doc", "docx", "txt", "rtf"],
    },
  },

  animations: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
    },
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const
