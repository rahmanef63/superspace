export interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  status: string
  isOnline: boolean
  lastSeen: number
  settings: UserSettings
  createdAt: number
  updatedAt: number
}

export interface UserSettings {
  privacy: PrivacySettings
  notifications: NotificationSettings
  chat: ChatSettings
  media: MediaSettings
}

export interface PrivacySettings {
  lastSeen: "everyone" | "contacts" | "nobody"
  profilePhoto: "everyone" | "contacts" | "nobody"
  status: "everyone" | "contacts" | "nobody"
  readReceipts: boolean
  groups: "everyone" | "contacts" | "nobody"
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
  popup: boolean
  preview: boolean
}

export interface ChatSettings {
  enterToSend: boolean
  fontSize: "small" | "medium" | "large"
  theme: "light" | "dark" | "system"
  wallpaper: string | null
  archiveChats: boolean
}

export interface MediaSettings {
  autoDownload: boolean
  quality: "low" | "medium" | "high"
  compression: boolean
  autoPlay: boolean
}
