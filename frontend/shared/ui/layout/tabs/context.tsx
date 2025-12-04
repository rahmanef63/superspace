/**
 * Tabs Context
 * 
 * Provides shared state and methods for tabs components.
 */

"use client"

import * as React from "react"
import type { 
  TabsContextValue, 
  TabVariant, 
  TabSize, 
  TabOrientation, 
  TabAlignment,
  TabItem 
} from "./types"

// ============================================================================
// Context
// ============================================================================

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("useTabsContext must be used within a Tabs component")
  }
  return context
}

export function useTabsContextSafe() {
  return React.useContext(TabsContext)
}

// ============================================================================
// Provider Props
// ============================================================================

interface TabsProviderProps {
  children: React.ReactNode
  activeTab: string | null
  setActiveTab: (id: string) => void
  variant: TabVariant
  size: TabSize
  orientation: TabOrientation
  alignment: TabAlignment
  lazy: boolean
  keepMounted: boolean
}

// ============================================================================
// Provider
// ============================================================================

export function TabsProvider({
  children,
  activeTab,
  setActiveTab,
  variant,
  size,
  orientation,
  alignment,
  lazy,
  keepMounted,
}: TabsProviderProps) {
  const tabsRef = React.useRef<Map<string, TabItem>>(new Map())
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  const registerTab = React.useCallback((tab: TabItem) => {
    tabsRef.current.set(tab.id, tab)
    // Only force update if we need reactivity for the tabs list
    // Most use cases don't need this, so we skip the re-render
  }, [])

  const unregisterTab = React.useCallback((id: string) => {
    tabsRef.current.delete(id)
    // Don't trigger re-render on unregister to avoid infinite loops
  }, [])

  // Stable getter for tabs
  const getTabs = React.useCallback(() => tabsRef.current, [])

  const value = React.useMemo<TabsContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      variant,
      size,
      orientation,
      alignment,
      lazy,
      keepMounted,
      tabs: tabsRef.current,
      registerTab,
      unregisterTab,
    }),
    [
      activeTab,
      setActiveTab,
      variant,
      size,
      orientation,
      alignment,
      lazy,
      keepMounted,
      registerTab,
      unregisterTab,
    ]
  )

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  )
}

export { TabsContext }
