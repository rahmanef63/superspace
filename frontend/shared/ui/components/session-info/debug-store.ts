/**
 * Session Debug Store
 * 
 * Zustand store for tracking AI agent calls, tool executions, and debug logs.
 * This store is used by the Debug tab in SessionInfoPanel.
 */

import { create } from "zustand"
import type { AgentTrace, ToolCallTrace, DebugLog, SessionDebugState } from "./types"

// ============================================================================
// Store Interface
// ============================================================================

interface SessionDebugStore extends SessionDebugState {
  // Actions
  setDebugging: (enabled: boolean) => void
  
  // Agent traces
  addAgentTrace: (trace: Omit<AgentTrace, "id">) => string
  updateAgentTrace: (id: string, updates: Partial<AgentTrace>) => void
  completeAgentTrace: (id: string, response?: string, error?: string) => void
  
  // Tool call traces
  addToolCallTrace: (trace: Omit<ToolCallTrace, "id">) => string
  updateToolCallTrace: (id: string, updates: Partial<ToolCallTrace>) => void
  completeToolCall: (id: string, result?: any, error?: string) => void
  
  // Logs
  log: (level: DebugLog["level"], source: string, message: string, data?: any) => void
  clearLogs: () => void
  
  // Clear all
  clearAll: () => void
  
  // Get traces for a specific session
  getTracesForSession: (sessionId: string) => {
    agents: AgentTrace[]
    tools: ToolCallTrace[]
    logs: DebugLog[]
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// ============================================================================
// Store
// ============================================================================

const MAX_LOGS = 500
const MAX_TRACES = 100

export const useSessionDebugStore = create<SessionDebugStore>((set, get) => ({
  // Initial state
  isDebugging: false,
  agentTraces: [],
  toolCallTraces: [],
  logs: [],
  lastUpdated: Date.now(),

  // Toggle debugging
  setDebugging: (enabled) => {
    set({ isDebugging: enabled })
    if (enabled) {
      get().log("info", "Debug", "Debugging enabled")
    }
  },

  // Add agent trace
  addAgentTrace: (trace) => {
    const id = generateId()
    const fullTrace: AgentTrace = {
      ...trace,
      id,
      status: trace.status || "routing",
    }
    
    set((state) => ({
      agentTraces: [fullTrace, ...state.agentTraces].slice(0, MAX_TRACES),
      lastUpdated: Date.now(),
    }))
    
    get().log("debug", "Agent", `Agent ${trace.agentName} started processing`, { query: trace.query })
    
    return id
  },

  // Update agent trace
  updateAgentTrace: (id, updates) => {
    set((state) => ({
      agentTraces: state.agentTraces.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      lastUpdated: Date.now(),
    }))
  },

  // Complete agent trace
  completeAgentTrace: (id, response, error) => {
    const trace = get().agentTraces.find((t) => t.id === id)
    if (!trace) return
    
    const duration = Date.now() - trace.timestamp
    const status = error ? "error" : "completed"
    
    set((state) => ({
      agentTraces: state.agentTraces.map((t) =>
        t.id === id
          ? { ...t, status, response, error, duration }
          : t
      ),
      lastUpdated: Date.now(),
    }))
    
    if (error) {
      get().log("error", "Agent", `Agent ${trace.agentName} failed: ${error}`)
    } else {
      get().log("info", "Agent", `Agent ${trace.agentName} completed in ${duration}ms`)
    }
  },

  // Add tool call trace
  addToolCallTrace: (trace) => {
    const id = generateId()
    const fullTrace: ToolCallTrace = {
      ...trace,
      id,
      status: "pending",
    }
    
    set((state) => ({
      toolCallTraces: [fullTrace, ...state.toolCallTraces].slice(0, MAX_TRACES),
      lastUpdated: Date.now(),
    }))
    
    get().log("debug", "Tool", `Tool ${trace.toolName} called by ${trace.agentName}`, { params: trace.params })
    
    return id
  },

  // Update tool call trace
  updateToolCallTrace: (id, updates) => {
    set((state) => ({
      toolCallTraces: state.toolCallTraces.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      lastUpdated: Date.now(),
    }))
  },

  // Complete tool call
  completeToolCall: (id, result, error) => {
    const trace = get().toolCallTraces.find((t) => t.id === id)
    if (!trace) return
    
    const duration = Date.now() - trace.timestamp
    const status = error ? "error" : "success"
    
    set((state) => ({
      toolCallTraces: state.toolCallTraces.map((t) =>
        t.id === id
          ? { ...t, status, result, error, duration }
          : t
      ),
      lastUpdated: Date.now(),
    }))
    
    if (error) {
      get().log("error", "Tool", `Tool ${trace.toolName} failed: ${error}`)
    } else {
      get().log("info", "Tool", `Tool ${trace.toolName} completed in ${duration}ms`)
    }
  },

  // Add log entry
  log: (level, source, message, data) => {
    const entry: DebugLog = {
      id: generateId(),
      timestamp: Date.now(),
      level,
      source,
      message,
      data,
    }
    
    set((state) => ({
      logs: [entry, ...state.logs].slice(0, MAX_LOGS),
      lastUpdated: Date.now(),
    }))
    
    // Also log to console if debugging is enabled
    if (get().isDebugging) {
      const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log"
      console[consoleMethod](`[${source}] ${message}`, data || "")
    }
  },

  // Clear logs
  clearLogs: () => {
    set({ logs: [], lastUpdated: Date.now() })
  },

  // Clear all traces and logs
  clearAll: () => {
    set({
      agentTraces: [],
      toolCallTraces: [],
      logs: [],
      lastUpdated: Date.now(),
    })
  },

  // Get traces for a specific session (filter by timestamp range or session markers)
  getTracesForSession: (sessionId) => {
    // For now, return all traces - in future could filter by session markers
    const state = get()
    return {
      agents: state.agentTraces,
      tools: state.toolCallTraces,
      logs: state.logs,
    }
  },
}))

// ============================================================================
// Helper Hook for Components
// ============================================================================

export function useDebugLogging() {
  const { log, isDebugging, setDebugging } = useSessionDebugStore()
  
  return {
    isDebugging,
    setDebugging,
    logInfo: (source: string, message: string, data?: any) => log("info", source, message, data),
    logWarn: (source: string, message: string, data?: any) => log("warn", source, message, data),
    logError: (source: string, message: string, data?: any) => log("error", source, message, data),
    logDebug: (source: string, message: string, data?: any) => log("debug", source, message, data),
  }
}
