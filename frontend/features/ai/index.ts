// Main components (legacy)
export * from "./AIListView"
export * from "./AIDetailView"
export * from "./AIView"

// Refactored views (uses shared/communications)
export * from "./view"

// Sub-components
export * from "./components"

// Types
export * from "./types"

// Utilities
export * from "./utils"

// Constants
export * from "./constants"

// Hooks
export * from "./hooks"

// Stores
export * from "./stores"

// Services
export * from "./lib"

// AI Wiki / Knowledge Base
export * from "./wiki"

// Re-export shared AI components for convenience
export {
  AIMessage,
  AIInput,
  AIHeader,
  AIThread,
  AIContainer,
  AISessionCard,
  AIEmptyState,
  AIKnowledgeSelector,
  useAI,
  useAIStoreBase,
  createAIStore,
  aiStoreSelectors,
} from "@/frontend/shared/communications"

export type {
  AIMessageType,
  AISession,
  AISettings,
  AIConfig,
  AILayout,
  AIEvents,
  AIKnowledgeContext,
  KnowledgeSourceType,
} from "@/frontend/shared/communications"
