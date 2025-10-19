export const WA_CONFIG = {
  MAX_MESSAGE_LENGTH: 4096,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  SUPPORTED_AUDIO_TYPES: ["audio/mp3", "audio/wav", "audio/ogg"],
  SUPPORTED_VIDEO_TYPES: ["video/mp4", "video/webm"],
  TYPING_INDICATOR_DELAY: 1000,
  MESSAGE_BATCH_SIZE: 50,
  CHAT_REFRESH_INTERVAL: 30000,
} as const

export const WA_ROUTES = {
  CHATS: "/chats",
  CALLS: "/calls",
  STATUS: "/status",
  AI: "/ai",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  STARRED: "/starred",
  ARCHIVED: "/archived",
  LOCKED: "/locked",
} as const
