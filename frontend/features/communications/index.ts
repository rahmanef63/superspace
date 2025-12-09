/**
 * Communications Feature
 * 
 * Unified communication platform supporting:
 * - Text channels (text, voice, video)
 * - Direct messages (1:1 and group)
 * - Voice/video calls with screen sharing
 * - Role-based permissions (Discord/Slack-like)
 * - AI bot integrations
 * - Real-time presence and typing indicators
 * - Threaded conversations
 * 
 * Migrated from: frontend/features/chat + frontend/features/calls
 * 
 * @module features/communications
 */

// Public exports for Communications feature
export { default as CommunicationsPage } from "./page"
export { default as config } from "./config"

// Main feature hook
export { useCommunications, useConversation, useCall, useCallHistory } from "./hooks/useCommunications"

// Types
export * from "./shared/types"

// Permissions
export * from "./shared/permissions"

// Store selectors
export {
  useCommunicationsStore,
  // Channel selectors
  useChannels,
  useCategories,
  useSelectedChannelId,
  useSelectedChannel,
  useChannelMessages,
  // Thread selectors
  useThreads,
  useSelectedThreadId,
  useThreadMessages,
  // Call selectors
  useActiveCall,
  useCallParticipants,
  useLocalMediaState,
  useScreenShares,
  // DM selectors
  useDirectConversations,
  useSelectedDirectId,
  useDirectMessages,
  // Presence selectors
  useUserPresence,
  useTypingIndicators,
  // AI selectors
  useBots,
  useChannelBots,
  // UI selectors
  useSidebarCollapsed,
  useActiveSidebarTab,
  useRightPanelOpen,
  useRightPanelContent,
  useActiveModal,
  useModalData,
  useViewMode,
} from "./shared/stores"

// View components
export { CommunicationsView } from "./views/CommunicationsView"
export { default as CommunicationsPageView } from "./views/CommunicationsPage"

// Components (dialogs, modals, etc.)
export { CreateChannelDialog } from "./components/CreateChannelDialog"

// Section components
export { ChannelSidebar } from "./sections/ChannelSidebar"
export { DirectSidebar } from "./sections/DirectSidebar"
export { MessageArea } from "./sections/MessageArea"
export { MemberPanel } from "./sections/MemberPanel"
export { CallView } from "./sections/CallView"

// Data fetching hooks (prefixed with 'query' to avoid conflicts with store selectors)
export {
  useChannels as useChannelsQuery,
  useChannel,
  useChannelCategories,
  useChannelMembers,
  useChannelRoles,
  useChannelMutations,
} from "./hooks/useChannels"

export {
  useMessages as useMessagesQuery,
  useThreadMessages as useThreadMessagesQuery,
  useTypingIndicators as useTypingIndicatorsQuery,
  useMessageMutations,
} from "./hooks/useMessages"

export {
  useCalls,
  useActiveCallData,
  useCallParticipantsData,
  useCallMutations,
} from "./hooks/useCalls"

export {
  usePresence,
  useUserPresence as useUserPresenceQuery,
  usePresenceMutations,
  useAutoPresence,
} from "./hooks/usePresence"

export {
  useDirectConversations as useDirectConversationsQuery,
  useDirectMessages as useDirectMessagesQuery,
  useDirectMessageMutations,
  useStartConversation,
} from "./hooks/useDirectMessages"

export {
  useAIBots,
  useChannelBots as useChannelBotsQuery,
  useAIMutations,
  useAIFeatures,
} from "./hooks/useAI"
