/**
 * AI Assistant Panel Context
 * 
 * Provides a context for controlling the AI assistant panel state
 * from anywhere in the feature layout. Used with TwoColumnWithAILayout.
 * 
 * @example
 * ```tsx
 * // Wrap your feature layout
 * <AIAssistantPanelProvider featureId="documents">
 *   <MyFeatureLayout />
 * </AIAssistantPanelProvider>
 * 
 * // Access the panel controls from anywhere inside
 * const { openPanel, closePanel, isPanelOpen } = useAIAssistantPanel();
 * ```
 */

"use client"

import * as React from "react"

// ============================================================================
// Types
// ============================================================================

export interface AIAssistantPanelContextValue {
  /** Whether the AI panel is currently open */
  isPanelOpen: boolean
  /** Open the AI panel */
  openPanel: () => void
  /** Close the AI panel */
  closePanel: () => void
  /** Toggle the AI panel */
  togglePanel: () => void
  /** The feature ID this panel is for */
  featureId: string
  /** Additional context data to pass to the AI */
  context: Record<string, any>
  /** Update the context data */
  setContext: (context: Record<string, any>) => void
}

export interface AIAssistantPanelProviderProps {
  /** Feature ID for the AI assistant */
  featureId: string
  /** Whether to default the panel to open */
  defaultOpen?: boolean
  /** Initial context data */
  initialContext?: Record<string, any>
  /** Children components */
  children: React.ReactNode
}

// ============================================================================
// Context
// ============================================================================

const AIAssistantPanelContext = React.createContext<AIAssistantPanelContextValue | null>(null)

// ============================================================================
// Provider
// ============================================================================

export function AIAssistantPanelProvider({
  featureId,
  defaultOpen = false,
  initialContext = {},
  children,
}: AIAssistantPanelProviderProps) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(defaultOpen)
  const [context, setContext] = React.useState<Record<string, any>>(initialContext)

  const openPanel = React.useCallback(() => setIsPanelOpen(true), [])
  const closePanel = React.useCallback(() => setIsPanelOpen(false), [])
  const togglePanel = React.useCallback(() => setIsPanelOpen(prev => !prev), [])

  const value = React.useMemo<AIAssistantPanelContextValue>(() => ({
    isPanelOpen,
    openPanel,
    closePanel,
    togglePanel,
    featureId,
    context,
    setContext,
  }), [isPanelOpen, openPanel, closePanel, togglePanel, featureId, context])

  return (
    <AIAssistantPanelContext.Provider value={value}>
      {children}
    </AIAssistantPanelContext.Provider>
  )
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access the AI Assistant Panel context.
 * Must be used within an AIAssistantPanelProvider.
 */
export function useAIAssistantPanel(): AIAssistantPanelContextValue {
  const context = React.useContext(AIAssistantPanelContext)
  if (!context) {
    throw new Error(
      "useAIAssistantPanel must be used within an AIAssistantPanelProvider"
    )
  }
  return context
}

/**
 * Hook to access the AI Assistant Panel context safely.
 * Returns null if not within a provider (useful for optional integration).
 */
export function useAIAssistantPanelSafe(): AIAssistantPanelContextValue | null {
  return React.useContext(AIAssistantPanelContext)
}
