/**
 * Central exports for all chat-based features
 * @module features
 */

// Workspace Chat (updated)
export { WorkspaceChatContainer } from "./chat/components/WorkspaceChatContainer";
export type { WorkspaceChatContainerProps } from "./chat/components/WorkspaceChatContainer";
export {
  useConvexChatDataSource,
  useChatMessages,
  useChatRoom,
  useChatParticipants,
} from "./chat/adapters/convexChatAdapter";

// AI Chat (updated)
export { AIChatContainer } from "./ai/components/AIChatContainer";
export { RefactoredAIView } from "./ai/RefactoredAIView";
export type { AIChatContainerProps } from "./ai/components/AIChatContainer";
export type { RefactoredAIViewProps } from "./ai/RefactoredAIView";

// Comments/Threads (new)
export { CommentsPanel } from "./comments/components/CommentsPanel";
export { useComments } from "./comments/hooks/useComments";
export type { CommentsPanelProps } from "./comments/components/CommentsPanel";
export type { CommentsState } from "./comments/hooks/useComments";

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
export { NotificationFeed } from "./notifications/components/NotificationFeed";
export type { NotificationFeedProps } from "./notifications/components/NotificationFeed";

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
