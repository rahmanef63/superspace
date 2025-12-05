/**
 * AI Components Wrapper
 * 
 * Re-exports and extends shadcn.io AI components for shared use across features.
 * This module wraps the base shadcn-io/ai components with project-specific enhancements:
 * 
 * - AIMessageAvatar: Uses Clerk avatar for users, dynamic icons for AI
 * - ActionWithFeedback: Action button with click feedback (toast/animation)
 * - BranchConversation: Branch component for regenerate functionality
 * 
 * @see components/ui/shadcn-io/ai for base implementations
 * @see https://www.shadcn.io/ai for original documentation
 * 
 * @example
 * ```tsx
 * import { 
 *   Message, MessageContent, AIMessageAvatar,
 *   ActionWithFeedback,
 *   BranchConversation,
 * } from '@/frontend/shared/communications/components/shadcn-ai'
 * ```
 */

// ============================================================================
// Base Components - Re-exported from shadcn-io/ai
// ============================================================================

// Message
export {
  Message,
  MessageContent,
  MessageAvatar,
  type MessageProps,
  type MessageContentProps,
  type MessageAvatarProps,
} from '@/components/ui/shadcn-io/ai/message'

// Actions
export {
  Actions,
  Action,
  type ActionsProps,
  type ActionProps,
} from '@/components/ui/shadcn-io/ai/actions'

// Branch - For regenerated response variations
export {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
  type BranchProps,
  type BranchMessagesProps,
  type BranchSelectorProps,
  type BranchPreviousProps,
  type BranchNextProps,
  type BranchPageProps,
} from '@/components/ui/shadcn-io/ai/branch'

// Conversation
export {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  type ConversationProps,
  type ConversationContentProps,
  type ConversationScrollButtonProps,
} from '@/components/ui/shadcn-io/ai/conversation'

// Response
export {
  Response,
  type ResponseProps,
} from '@/components/ui/shadcn-io/ai/response'

// Prompt Input
export {
  PromptInput,
  PromptInputTextarea,
  type PromptInputProps,
  type PromptInputTextareaProps,
} from '@/components/ui/shadcn-io/ai/prompt-input'

// Tool
export {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  type ToolProps,
  type ToolHeaderProps,
  type ToolContentProps,
  type ToolInputProps,
  type ToolOutputProps,
} from '@/components/ui/shadcn-io/ai/tool'

// Reasoning
export {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  type ReasoningProps,
  type ReasoningTriggerProps,
  type ReasoningContentProps,
} from '@/components/ui/shadcn-io/ai/reasoning'

// Source
export {
  Source,
  type SourceProps,
} from '@/components/ui/shadcn-io/ai/source'

// Suggestion
export {
  Suggestions,
  Suggestion,
  type SuggestionsProps,
  type SuggestionProps,
} from '@/components/ui/shadcn-io/ai/suggestion'

// CodeBlock
export {
  CodeBlock,
  CodeBlockCopyButton,
  type CodeBlockProps,
  type CodeBlockCopyButtonProps,
} from '@/components/ui/shadcn-io/ai/code-block'

// Loader
export {
  Loader,
  type LoaderProps,
} from '@/components/ui/shadcn-io/ai/loader'

// Image
export {
  Image,
  type ImageProps,
} from '@/components/ui/shadcn-io/ai/image'

// InlineCitation
export {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
  InlineCitationQuote,
  type InlineCitationProps,
  type InlineCitationTextProps,
  type InlineCitationCardProps,
  type InlineCitationCardTriggerProps,
  type InlineCitationCardBodyProps,
  type InlineCitationCarouselProps,
  type InlineCitationCarouselHeaderProps,
  type InlineCitationCarouselIndexProps,
  type InlineCitationCarouselContentProps,
  type InlineCitationCarouselItemProps,
  type InlineCitationSourceProps,
  type InlineCitationQuoteProps,
} from '@/components/ui/shadcn-io/ai/inline-citation'

// Task
export {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
  type TaskProps,
  type TaskTriggerProps,
  type TaskContentProps,
  type TaskItemProps,
  type TaskItemFileProps,
} from '@/components/ui/shadcn-io/ai/task'

// WebPreview
export {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
  type WebPreviewProps,
  type WebPreviewNavigationProps,
  type WebPreviewNavigationButtonProps,
  type WebPreviewUrlProps,
  type WebPreviewBodyProps,
  type WebPreviewConsoleProps,
} from '@/components/ui/shadcn-io/ai/web-preview'

// ============================================================================
// Extended Components - Project-specific enhancements
// ============================================================================

// AI Avatar with dynamic icons
export { 
  AIMessageAvatar, 
  UserMessageAvatar,
  type AIMessageAvatarProps,
  type UserMessageAvatarProps,
} from './ai-avatar'

// Action button with click feedback
export { 
  ActionWithFeedback,
  type ActionWithFeedbackProps,
} from './action-with-feedback'

// Note: Use Branch, BranchMessages, BranchSelector from shadcn-io/ai directly (exported above)
// The BranchConversation wrapper is kept for backward compatibility
export {
  BranchConversation,
  useBranchConversation,
  type BranchConversationProps,
} from './branch-conversation'
