/**
 * Central exports for all chat-based features
 * @module features
 */

// Chat functionality - re-export from shared/communications
export { 
  ChatContainer,
  useChat,
  createConvexChatDataSource,
  type ChatContainerProps,
  type ChatDataSource,
  type UserMeta,
} from "@/frontend/shared/communications";

// AI Chat (updated)
export { AIChatContainer } from "./ai/components/AIChatContainer";
export { default as AIDetailView } from "./ai/AIDetailView";
export type { AIChatContainerProps } from "./ai/components/AIChatContainer";

// Comments/Threads (new)
export { CommentsPanel } from "../shared/foundation/utils/comments/components/CommentsPanel";
export { useComments } from "../shared/foundation/utils/comments/hooks/useComments";
export type { CommentsPanelProps } from "../shared/foundation/utils/comments/components/CommentsPanel";
export type { CommentsState } from "../shared/foundation/utils/comments/hooks/useComments";

// Support/Helpdesk (new)
export { SupportChatContainer } from "./support/components/SupportChatContainer";
export { SupportDashboard } from "./support/components/SupportDashboard";
export type { SupportChatContainerProps } from "./support/components/SupportChatContainer";
export type { Ticket, SupportDashboardProps } from "./support/components/SupportDashboard";

// Projects (new)
export { ProjectDiscussionChat } from "./projects/components/ProjectDiscussionChat";
export type { ProjectDiscussionChatProps } from "./projects/components/ProjectDiscussionChat";

// Documents (updated)
export { DocumentCollaboration } from "./documents/components/DocumentCollaboration";
export type { DocumentCollaborationProps } from "./documents/components/DocumentCollaboration";

// CRM (new)
export { CRMChatContainer } from "./crm/components/CRMChatContainer";
export type { CRMChatContainerProps } from "./crm/components/CRMChatContainer";

// Notifications (new)
export { NotificationFeed } from "../shared/foundation/utils/notifications/components/NotificationFeed";
export type { NotificationFeedProps } from "../shared/foundation/utils/notifications/components/NotificationFeed";

// Workflow (new)
export { WorkflowAssistantChat } from "./workflow";
export type { WorkflowAssistantChatProps } from "./workflow";

/**
 * Usage Examples:
 *
 * import {
 *   WorkspaceChatContainer,
 *   AIChatContainer,
 *   CommentsPanel,
 *   SupportChatContainer,
 *   ProjectDiscussionChat,
 *   DocumentCollaboration,
 *   CRMChatContainer,
 *   NotificationFeed,
 *   WorkflowAssistantChat,
 * } from "@/frontend/features";
 */
