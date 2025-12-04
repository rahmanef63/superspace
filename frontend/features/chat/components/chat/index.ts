// Chat Components
export * from './ChatListItem';
export * from './MessageBubble'; 
export * from './ComposerBar';
export * from './ChatListView';
export * from './ChatListSidebar';
export { ChatDetailView } from './ChatDetailView';

// Refactored components (using shared/communications)
export { ChatMessageBubble } from './ChatMessageBubble';
export type { ChatMessageBubbleProps } from './ChatMessageBubble';
export { ChatComposerBar } from './ChatComposerBar';
export type { ChatComposerBarProps } from './ChatComposerBar';
export { ChatsViewRefactored } from './ChatsViewRefactored';

// Re-export shared chat components
export {
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
} from '@/frontend/shared/communications';

