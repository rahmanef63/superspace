/**
 * Session Info Types
 * 
 * Shared types for the Session Info component used across features.
 */

// ============================================================================
// Debug/Trace Types
// ============================================================================

export interface ToolCallTrace {
  id: string
  timestamp: number
  agentId: string
  agentName: string
  toolName: string
  params: Record<string, any>
  status: "pending" | "success" | "error"
  result?: any
  error?: string
  duration?: number
}

export interface AgentTrace {
  id: string
  timestamp: number
  agentId: string
  agentName: string
  query: string
  confidence: number
  status: "routing" | "processing" | "completed" | "error"
  response?: string
  toolCalls?: ToolCallTrace[]
  duration?: number
  error?: string
}

export interface DebugLog {
  id: string
  timestamp: number
  level: "info" | "warn" | "error" | "debug"
  source: string
  message: string
  data?: any
}

export interface SessionDebugState {
  isDebugging: boolean
  agentTraces: AgentTrace[]
  toolCallTraces: ToolCallTrace[]
  logs: DebugLog[]
  lastUpdated: number
}

// ============================================================================
// Session Types (Generic)
// ============================================================================

export interface SessionMessage {
  id?: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  metadata?: {
    tokenCount?: number
    duration?: number
    model?: string
    agentId?: string
    toolCalls?: Array<{
      id?: string
      name?: string
      toolName?: string
      params?: Record<string, any>
      result?: any
      error?: string
      duration?: number
      status?: string
      [key: string]: any
    }>
    [key: string]: any
  }
}

export interface SessionStats {
  totalMessages: number
  userMessages: number
  assistantMessages: number
  totalTokens: number
  estimatedCost: number
  totalDuration: number
  toolCallCount: number
}

export interface GenericSession {
  _id: string
  id?: string
  title: string
  icon?: string
  topic?: string
  status: "active" | "archived" | string
  messages: SessionMessage[]
  createdAt: number
  updatedAt: number
  metadata?: {
    provider?: string
    model?: string
    temperature?: number
    agentId?: string
    [key: string]: any
  }
  settings?: {
    model?: string
    [key: string]: any
  }
}

// ============================================================================
// Tab Types
// ============================================================================

export type SessionInfoTab = 
  | "overview"
  | "content"
  | "settings"
  | "knowledge"
  | "export"
  | "debug"

export interface SessionInfoTabConfig {
  id: SessionInfoTab
  label: string
  icon: string // Lucide icon name
  enabled: boolean
}

// ============================================================================
// Component Props
// ============================================================================

export interface SessionInfoPanelProps<T extends GenericSession = GenericSession> {
  /** The current session */
  session: T | null
  /** Available tabs (defaults to all) */
  tabs?: SessionInfoTab[]
  /** Default active tab */
  defaultTab?: SessionInfoTab
  /** Close handler */
  onClose?: () => void
  /** Delete handler */
  onDelete?: () => void
  /** Export handler */
  onExport?: (format: "json" | "markdown" | "pdf") => void
  /** Share handler */
  onShare?: () => void
  /** Title update handler */
  onUpdateTitle?: (title: string) => void
  /** Knowledge toggle handler */
  onKnowledgeToggle?: (enabled: boolean) => void
  /** Knowledge enabled state */
  knowledgeEnabled?: boolean
  /** Debug state for trace tab */
  debugState?: SessionDebugState
  /** Optional className */
  className?: string
  /** Show close button */
  showCloseButton?: boolean
  /** Compact mode (icon-only sidebar) */
  compact?: boolean
}
