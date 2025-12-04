/**
 * Communications Domain Facade
 *
 * Real-time communication features including:
 * - Chat system (messages, channels, threads)
 * - AI chat (AI assistants, bots)
 * - Comments (document comments, inline comments)
 * - Collaboration (presence, cursors, activity)
 * - Notifications (real-time alerts, inbox)
 *
 * NOTE: ChatContainer and AIContainer now use shared layout components from:
 * - PageContainer from @/frontend/shared/ui/layout/container
 * - ContainerHeader from @/frontend/shared/ui/layout/header
 * 
 * This ensures DRY principle - same container/header pattern as
 * menu-store, workspace-store, and documents features.
 *
 * @example
 * import { ChatContainer, AIContainer, useChat } from '@/frontend/shared/communications'
 */

// ============================================================
// Chat System
// ============================================================
export * from './chat'
// Chat components are in ./chat/components/
export { ChatInput } from './chat/components/ChatInput'
export { ChatContainer } from './chat/components/ChatContainer'
export { ChatHeader } from './chat/components/ChatHeader'
export { ChatMessage } from './chat/components/ChatMessage'
export { ChatSidebar } from './chat/components/ChatSidebar'
export { ChatThread } from './chat/components/ChatThread'
export { ChatComposer } from './chat/components/ChatComposer'
export { ActivityFeed as ChatActivityFeed } from './chat/components/ActivityFeed'
// Chat hooks
export { useChat } from './chat/hooks/useChat'
export { useChatPresence } from './chat/hooks/useChatPresence'
export { useChatScroll } from './chat/hooks/useChatScroll'
export { useMessageActions } from './chat/hooks/useMessageActions'

// ============================================================
// AI Chat System
// ============================================================
// AI Components
export {
  AIMessage as AIMessageComponent,
  AIInput,
  AIHeader,
  AIThread,
  AIContainer,
  AISessionCard,
  AIEmptyState,
  AIKnowledgeSelector,
} from './chat/components/ai'
// AI Hooks
export { useAI } from './chat/hooks/useAI'
export { useAIStoreBase, createAIStore, aiStoreSelectors } from './chat/hooks/useAIStore'
// AI Types (re-exported from ./chat)

// ============================================================
// Comments System
// ============================================================
export { CommentsPanel } from './comments/components/CommentsPanel'
// TODO: Add more comment components when available
// export * from './comments'

// ============================================================
// Collaboration Features
// ============================================================
export { PresenceIndicator } from './collaboration/PresenceIndicator'
export { CollaborativeCursor } from './collaboration/CollaborativeCursor'
// TODO: Add more collaboration exports when available
// export { ActivityFeed } from './collaboration/ActivityFeed'
// export { usePresence } from './collaboration/hooks/usePresence'
// export { useCollaboration } from './collaboration/hooks/useCollaboration'

// ============================================================
// Types
// ============================================================
export type {
  // Chat types
  Message,
  MessageContent,
  MessageDraft,
  UserMeta,
  Attachment,
  Paginated,
} from './chat/types/message'

export type {
  ChatRoomRef,
  RoomMeta,
} from './chat/types/chat'

export type {
  ChatConfig,
  ChatLayout,
} from './chat/types/config'

// AI Types
export type {
  AIMessage as AIMessageType,
  AISession,
  AIConfig,
  AIKnowledgeContext,
  KnowledgeSourceType,
} from './chat/types/ai'
