export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  AUDIO: "audio",
  VIDEO: "video",
  LOCATION: "location",
} as const

export const MESSAGE_STATUS = {
  SENDING: "sending",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
} as const

export const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const
