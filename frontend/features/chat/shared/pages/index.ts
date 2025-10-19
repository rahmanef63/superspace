// Main chat page (wa)
export { default as Page } from "../../page"
export { default as ChatPage } from "../../page"

// Chat subpages
export { default as ChatsPage } from "../../components/chat/page"
export { default as CallsPage } from "../../../calls/page"
export { default as ChatCallsPage } from "../../../calls/page"
export { default as StatusPage } from "../../components/status/page"
export { default as ChatStatusPage } from "../../components/status/page"
export { default as AIPage } from "../../components/ai/page"
export { default as ChatAIPage } from "../../components/ai/page"
export { default as StarredPage } from "../../components/starred/page"
export { default as ChatStarredPage } from "../../components/starred/page"
export { default as ArchivedPage } from "../../components/archived/page"
export { default as ChatArchivedPage } from "../../components/archived/page"
export { default as ChatSettingsPage } from "../../components/settings/page"
export { default as ChatProfilePage } from "../../components/profile/page"

// Placeholder exports for features not yet implemented (these are placeholders only)
// Real implementations are in their respective feature folders
// Canvas: frontend/features/canvas (if exists, otherwise placeholder)
// Documents: frontend/features/documents
// Reports: frontend/features/reports (if exists, otherwise placeholder)
export { default as CanvasPage } from "../../page" // TODO: implement canvas or use separate feature
export { default as ReportsPage } from "../../page" // TODO: implement reports or use separate feature
