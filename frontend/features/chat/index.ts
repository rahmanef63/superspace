// Export main components (UI components organized by feature)
export * from "./components"

// Export views (page-level components)
export * from "./views"

// Export shared functionality from shared module
// Note: Shared includes types, constants, utils, hooks, stores, data layers
export * from "./shared"

// Re-export shared/communications chat components for convenience
export {
  // Core chat components
  ChatContainer,
  ChatHeader,
  ChatMessage,
  ChatSidebar,
  ChatThread,
  ChatInput,
  ChatComposer,
  ActivityFeed,
  TypingIndicator,
  ReadReceipts,
  ReactionBar,
  MediaGallery,
  AttachmentButton,
  MemberInfoModal,
  MemberDetailView,
  
  // Core chat hooks
  useChat,
  useChatPresence,
  useChatScroll,
  useMessageActions,
  
  // Data sources
  createConvexChatDataSource,
  createMockChatDataSource,
  
  // Utilities
  formatTimestamp,
  formatUserName,
  extractMentions,
  extractUrls,
  
  // Config
  DEFAULT_CHAT_CONFIG,
  CHAT_CONFIG_PRESETS,
} from "@/frontend/shared/communications"

// Re-export shared chat types
export type {
  ChatConfig,
  ChatLayout,
  ChatContextMode,
  ChatDataSource,
  ChatRoomRef,
  RoomMeta,
  Message,
  MessageDraft,
  UserMeta,
  Attachment,
} from "@/frontend/shared/communications"
