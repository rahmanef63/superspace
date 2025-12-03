"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import type { IDELayoutState } from "./types"

/**
 * Hook for persisting IDE layout state to localStorage
 */
export function usePersistedLayoutState(
  persistKey: string | undefined,
  initialState?: IDELayoutState
) {
  const [state, setState] = useState<IDELayoutState>(() => {
    if (typeof window === "undefined" || !persistKey) {
      return initialState || {}
    }
    
    try {
      const stored = localStorage.getItem(`ide-layout-${persistKey}`)
      if (stored) {
        return { ...initialState, ...JSON.parse(stored) }
      }
    } catch {
      // Ignore parse errors
    }
    
    return initialState || {}
  })
  
  // Persist to localStorage when state changes
  useEffect(() => {
    if (typeof window === "undefined" || !persistKey) return
    
    try {
      localStorage.setItem(`ide-layout-${persistKey}`, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
  }, [persistKey, state])
  
  const updateState = useCallback((updates: Partial<IDELayoutState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])
  
  return [state, updateState] as const
}

/**
 * Hook for managing panel visibility toggles
 */
export function usePanelVisibility(
  initialPrimary = true,
  initialSecondary = false,
  initialPanel = false
) {
  const [primaryVisible, setPrimaryVisible] = useState(initialPrimary)
  const [secondaryVisible, setSecondaryVisible] = useState(initialSecondary)
  const [panelVisible, setPanelVisible] = useState(initialPanel)
  
  const togglePrimary = useCallback(() => {
    setPrimaryVisible(prev => !prev)
  }, [])
  
  const toggleSecondary = useCallback(() => {
    setSecondaryVisible(prev => !prev)
  }, [])
  
  const togglePanel = useCallback(() => {
    setPanelVisible(prev => !prev)
  }, [])
  
  return {
    primaryVisible,
    secondaryVisible,
    panelVisible,
    togglePrimary,
    toggleSecondary,
    togglePanel,
    setPrimaryVisible,
    setSecondaryVisible,
    setPanelVisible,
  }
}

import type { EditorTab } from "./types"

/**
 * Hook for managing editor tabs
 */
export function useEditorTabs(initialTabs: EditorTab[] = []) {
  const [tabs, setTabs] = useState<EditorTab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState<string | undefined>(
    initialTabs[0]?.id
  )
  
  const openTab = useCallback((tab: EditorTab) => {
    setTabs(prev => {
      const exists = prev.find(t => t.id === tab.id)
      if (exists) {
        setActiveTabId(tab.id)
        return prev
      }
      return [...prev, { ...tab, closable: tab.closable ?? true }]
    })
    setActiveTabId(tab.id)
  }, [])
  
  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const index = prev.findIndex(t => t.id === id)
      if (index === -1) return prev
      
      const newTabs = prev.filter(t => t.id !== id)
      
      // If closing active tab, activate the previous or next tab
      if (activeTabId === id && newTabs.length > 0) {
        const newIndex = Math.min(index, newTabs.length - 1)
        setActiveTabId(newTabs[newIndex]?.id)
      } else if (newTabs.length === 0) {
        setActiveTabId(undefined)
      }
      
      return newTabs
    })
  }, [activeTabId])
  
  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev]
      const [removed] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, removed)
      return newTabs
    })
  }, [])
  
  const pinTab = useCallback((id: string) => {
    setTabs(prev => 
      prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t)
    )
  }, [])
  
  return {
    tabs,
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab,
    reorderTabs,
    pinTab,
  }
}

/**
 * Hook for keyboard shortcuts
 */
export function useIDEKeyboardShortcuts(handlers: {
  togglePrimary?: () => void
  toggleSecondary?: () => void
  togglePanel?: () => void
  closeActiveTab?: () => void
  focusSearch?: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B: Toggle primary sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        handlers.togglePrimary?.()
      }
      
      // Cmd/Ctrl + Shift + B: Toggle secondary sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "B") {
        e.preventDefault()
        handlers.toggleSecondary?.()
      }
      
      // Cmd/Ctrl + J: Toggle bottom panel
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault()
        handlers.togglePanel?.()
      }
      
      // Cmd/Ctrl + W: Close active tab
      if ((e.metaKey || e.ctrlKey) && e.key === "w") {
        e.preventDefault()
        handlers.closeActiveTab?.()
      }
      
      // Cmd/Ctrl + P: Focus search/command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault()
        handlers.focusSearch?.()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlers])
}
