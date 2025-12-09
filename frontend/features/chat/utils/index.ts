/**
 * Chat Feature Utilities
 * Re-exports shared utilities and adds chat-specific helpers
 */

export * from "./formatters"
export * from "./helpers"

// Re-export shared utilities (DRY)
export {
  formatTimestamp,
  getInitials,
  truncateText,
  formatFileSize,
  isImageFile,
  isVideoFile,
  isAudioFile,
} from "@/frontend/shared/communications"

// Legacy utility functions
import { cn } from "@/lib/utils"

// Chats-specific component utilities using design system
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
