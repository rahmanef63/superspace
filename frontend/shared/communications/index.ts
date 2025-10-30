/**
 * Communications Domain Facade
 *
 * Real-time communication features including:
 * - Chat system (messages, channels, threads)
 * - Comments (document comments, inline comments)
 * - Collaboration (presence, cursors, activity)
 * - Notifications (real-time alerts, inbox)
 *
 * @example
 * import { ChatView, useChat, CommentThread } from '@/frontend/shared/communications'
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
  Channel,
  Thread,
  ChatState,

  // Comment types
  Comment,
  CommentThread as CommentThreadType,

  // Collaboration types
  Presence,
  Collaborator,
  Activity,
} from './chat/types'
