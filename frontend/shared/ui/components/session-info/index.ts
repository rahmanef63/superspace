/**
 * Session Info Components
 * 
 * Shared session info panel with tabs for use across features (AI, Documents, etc.)
 * 
 * Features:
 * - Overview: Session stats, model config, tokens/cost
 * - Content: Generated artifacts
 * - Settings: Session preferences
 * - Knowledge: Context toggle
 * - Export: Download/share options
 * - Debug: Real-time agent & tool tracing
 * 
 * Usage:
 * ```tsx
 * import { SessionInfoTabs, useSessionDebugStore } from "@/frontend/shared/ui/components/session-info"
 * 
 * // In your component
 * <SessionInfoTabs
 *   session={selectedSession}
 *   tabs={["overview", "settings", "debug"]}
 *   onClose={handleClose}
 * />
 * 
 * // To log debug info from your feature
 * const { addAgentTrace, addToolCallTrace, log } = useSessionDebugStore()
 * ```
 */

// Main component
export { SessionInfoTabs, default } from "./SessionInfoTabs"

// Debug store for tracking AI calls
export { useSessionDebugStore, useDebugLogging } from "./debug-store"

// Types
export type {
  // Debug types
  ToolCallTrace,
  AgentTrace,
  DebugLog,
  SessionDebugState,
  // Session types
  SessionMessage,
  SessionStats,
  GenericSession,
  // Tab types
  SessionInfoTab,
  SessionInfoTabConfig,
  // Props
  SessionInfoPanelProps,
} from "./types"
