export * from "./formatters"
export * from "./helpers"
export * from "./validators"

// Legacy utility functions
import { cn } from "@/lib/utils"

// WhatsApp-specific utility functions with design system classes
export const formatTimestamp = (timestamp: string): string => {
  if (timestamp.includes(":")) {
    return timestamp // Already formatted
  }

  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } else if (diffInHours < 168) {
    // Less than a week
    return date.toLocaleDateString("en-US", { weekday: "short" })
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const truncateText = (text: string, maxLength = 50): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"]
  const extension = fileName.split(".").pop()?.toLowerCase()
  return imageExtensions.includes(extension || "")
}

export const isVideoFile = (fileName: string): boolean => {
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"]
  const extension = fileName.split(".").pop()?.toLowerCase()
  return videoExtensions.includes(extension || "")
}

export const isAudioFile = (fileName: string): boolean => {
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac"]
  const extension = fileName.split(".").pop()?.toLowerCase()
  return audioExtensions.includes(extension || "")
}

// WhatsApp-specific component utilities using design system
export const waClasses = {
  chatItem: (isActive: boolean) =>
    cn(
      "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground",
    ),

  messageBubble: (variant: "sent" | "received" | "system") =>
    cn(
      "rounded-2xl px-3 py-2 max-w-[70%] break-words",
      variant === "sent" && "bg-primary text-primary-foreground rounded-br-md",
      variant === "received" && "bg-muted text-foreground rounded-bl-md",
      variant === "system" && "bg-transparent text-muted-foreground",
    ),

  scrollArea: cn("overflow-y-auto"),

  mobileOnly: cn("block lg:hidden"),
  desktopOnly: cn("hidden lg:block"),
}

export { cn }
