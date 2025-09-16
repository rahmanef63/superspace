export const MEDIA_TYPES = {
  IMAGE: {
    JPEG: "image/jpeg",
    PNG: "image/png",
    GIF: "image/gif",
    WEBP: "image/webp",
  },
  AUDIO: {
    MP3: "audio/mp3",
    WAV: "audio/wav",
    OGG: "audio/ogg",
    M4A: "audio/m4a",
  },
  VIDEO: {
    MP4: "video/mp4",
    WEBM: "video/webm",
    MOV: "video/mov",
  },
  DOCUMENT: {
    PDF: "application/pdf",
    DOC: "application/msword",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    XLS: "application/vnd.ms-excel",
    XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
} as const

export const MAX_FILE_SIZES = {
  IMAGE: 16 * 1024 * 1024, // 16MB
  AUDIO: 100 * 1024 * 1024, // 100MB
  VIDEO: 64 * 1024 * 1024, // 64MB
  DOCUMENT: 100 * 1024 * 1024, // 100MB
} as const
