// Main components
export * from "./AIListView"
export * from "./AIDetailView"
export * from "./AIView"

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

// Re-export AI Elements components (new shadcn.io/ai style components)
export {
  // New AI Elements
  Message,
  MessageContent,
  MessageAvatar,
  Response,
  Conversation,
  ConversationContent,
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputAttachButton,
  PromptInputAttachments,
  Actions,
  Action,
  Tool,
  ToolHeader,
  ToolContent,
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
  Suggestions,
  Suggestion,
  Branch,
  CodeBlock,
  Loader,
  Image,
  InlineCitation,
  Task,
  WebPreview,
  // AI Hooks
  useAI,
  useAIStoreBase,
  createAIStore,
  aiStoreSelectors,
} from "@/frontend/shared/communications"

export type {
  AIMessage as AIMessageType,
  AISession,
  AIConfig,
  AIKnowledgeContext,
  KnowledgeSourceType,
} from "@/frontend/shared/communications"
