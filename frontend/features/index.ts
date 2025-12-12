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

// AI Chat
export { default as AIDetailView } from "./ai/AIDetailView";

// Comments/Threads
export { CommentsPanel } from "../shared/foundation/utils/comments/components/CommentsPanel";
export { useComments } from "../shared/foundation/utils/comments/hooks/useComments";
export type { CommentsPanelProps } from "../shared/foundation/utils/comments/components/CommentsPanel";
export type { CommentsState } from "../shared/foundation/utils/comments/hooks/useComments";

// Support/Helpdesk
export { SupportChatContainer } from "./support/components/SupportChatContainer";
export { SupportDashboard } from "./support/components/SupportDashboard";
export type { SupportChatContainerProps } from "./support/components/SupportChatContainer";
export type { Ticket, SupportDashboardProps } from "./support/components/SupportDashboard";

// Projects
export { ProjectDiscussionChat } from "./projects/components/ProjectDiscussionChat";
export type { ProjectDiscussionChatProps } from "./projects/components/ProjectDiscussionChat";

// CRM - Updated to new view structure
export { CrmView } from "./crm/views/CrmView";

// Notifications
export { NotificationFeed } from "../shared/foundation/utils/notifications/components/NotificationFeed";
export type { NotificationFeedProps } from "../shared/foundation/utils/notifications/components/NotificationFeed";

/**
 * Usage Examples:
 *
 * import {
 *   ChatContainer,
 *   AIDetailView,
 *   CommentsPanel,
 *   SupportChatContainer,
 *   ProjectDiscussionChat,
 *   CrmView,
 *   NotificationFeed,
 * } from "@/frontend/features";
 */
