/**
 * Communications Hooks
 * 
 * Data fetching and real-time subscription hooks for the communications feature.
 * These hooks integrate with Convex for backend data.
 * 
 * @module features/communications/hooks
 */

// Main feature hook (SSOT for feature data)
export {
  useCommunications,
  useConversation,
  useCall,
  useCallHistory,
} from "./useCommunications"

// Sample data hook (for development/demo)
export { useSampleData } from "./useSampleData"

// Channel hooks
export {
  useChannels,
  useChannel,
  useChannelCategories,
  useChannelMembers,
  useChannelRoles,
  useChannelMutations,
} from "./useChannels"

// Message hooks
export {
  useMessages,
  useThreadMessages,
  useTypingIndicators,
  useMessageMutations,
} from "./useMessages"

// Call hooks
export {
  useCalls,
  useActiveCallData,
  useCallParticipantsData,
  useCallMutations,
} from "./useCalls"

// Presence hooks
export {
  usePresence,
  useUserPresence,
  usePresenceMutations,
  useAutoPresence,
} from "./usePresence"

// Direct message hooks
export {
  useDirectConversations,
  useDirectMessages,
  useDirectMessageMutations,
  useStartConversation,
} from "./useDirectMessages"

// AI hooks
export {
  useAIBots,
  useChannelBots,
  useAIMutations,
  useAIFeatures,
} from "./useAI"
