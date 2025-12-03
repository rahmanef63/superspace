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
  const [tabs, setTabs] = React.useState<Map<string, TabItem>>(new Map())

  const registerTab = React.useCallback((tab: TabItem) => {
    setTabs((prev) => {
      const next = new Map(prev)
      next.set(tab.id, tab)
      return next
    })
  }, [])

  const unregisterTab = React.useCallback((id: string) => {
    setTabs((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

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
      tabs,
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
      tabs,
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
