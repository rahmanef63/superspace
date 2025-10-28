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
export { ChatView } from './chat/ChatView'
export { ChatInput } from './chat/ChatInput'
export { MessageList } from './chat/MessageList'
export { ChannelList } from './chat/ChannelList'
export { useChat } from './chat/hooks/useChat'
export { useChatState } from './chat/hooks/useChatState'

// ============================================================
// Comments System
// ============================================================
export * from './comments'
export { CommentThread } from './comments/CommentThread'
export { CommentInput } from './comments/CommentInput'
export { InlineComment } from './comments/InlineComment'
export { useComments } from './comments/hooks/useComments'

// ============================================================
// Collaboration Features
// ============================================================
export * from './collaboration'
export { PresenceIndicator } from './collaboration/PresenceIndicator'
export { CollaboratorCursor } from './collaboration/CollaboratorCursor'
export { ActivityFeed } from './collaboration/ActivityFeed'
export { usePresence } from './collaboration/hooks/usePresence'
export { useCollaboration } from './collaboration/hooks/useCollaboration'

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
