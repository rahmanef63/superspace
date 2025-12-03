"use client"

import * as React from "react"
import { createContext, useContext } from "react"
import type { IDELayoutState, IDELayoutConfig } from "./types"

interface IDEContextValue {
  // Layout config
  config: IDELayoutConfig
  
  // Current state
  state: IDELayoutState
  
  // State updaters
  setPrimaryVisible: (visible: boolean) => void
  setSecondaryVisible: (visible: boolean) => void
  setPanelVisible: (visible: boolean) => void
  setPrimarySize: (size: number) => void
  setSecondarySize: (size: number) => void
  setPanelSize: (size: number) => void
  setActivityBarActive: (id: string | undefined) => void
  
  // Toggle helpers
  togglePrimary: () => void
  toggleSecondary: () => void
  togglePanel: () => void
}

const IDEContext = createContext<IDEContextValue | null>(null)

export function useIDEContext() {
  const context = useContext(IDEContext)
  if (!context) {
    throw new Error("useIDEContext must be used within IDELayoutProvider")
  }
  return context
}

export function useIDEContextSafe() {
  return useContext(IDEContext)
}

interface IDELayoutProviderProps {
  children: React.ReactNode
  config?: IDELayoutConfig
  state: IDELayoutState
  onStateChange: (updates: Partial<IDELayoutState>) => void
}

export function IDELayoutProvider({
  children,
  config = {},
  state,
  onStateChange,
}: IDELayoutProviderProps) {
  const value: IDEContextValue = {
    config,
    state,
    
    setPrimaryVisible: (visible) => onStateChange({ primaryVisible: visible }),
    setSecondaryVisible: (visible) => onStateChange({ secondaryVisible: visible }),
    setPanelVisible: (visible) => onStateChange({ panelVisible: visible }),
    setPrimarySize: (size) => onStateChange({ primarySize: size }),
    setSecondarySize: (size) => onStateChange({ secondarySize: size }),
    setPanelSize: (size) => onStateChange({ panelSize: size }),
    setActivityBarActive: (id) => onStateChange({ activityBarActive: id }),
    
    togglePrimary: () => onStateChange({ primaryVisible: !state.primaryVisible }),
    toggleSecondary: () => onStateChange({ secondaryVisible: !state.secondaryVisible }),
    togglePanel: () => onStateChange({ panelVisible: !state.panelVisible }),
  }
  
  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  )
}
