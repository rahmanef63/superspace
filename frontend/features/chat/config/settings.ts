export interface WASettings {
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    preview: boolean
  }
  privacy: {
    lastSeen: "everyone" | "contacts" | "nobody"
    profilePhoto: "everyone" | "contacts" | "nobody"
    status: "everyone" | "contacts" | "nobody"
    readReceipts: boolean
  }
  chat: {
    enterToSend: boolean
    fontSize: "small" | "medium" | "large"
    theme: "light" | "dark" | "system"
    wallpaper: string | null
  }
  media: {
    autoDownload: boolean
    quality: "low" | "medium" | "high"
    compression: boolean
  }
}

export const DEFAULT_WA_SETTINGS: WASettings = {
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    preview: true,
  },
  privacy: {
    lastSeen: "everyone",
    profilePhoto: "everyone",
    status: "everyone",
    readReceipts: true,
  },
  chat: {
    enterToSend: true,
    fontSize: "medium",
    theme: "system",
    wallpaper: null,
  },
  media: {
    autoDownload: true,
    quality: "medium",
    compression: true,
  },
}
