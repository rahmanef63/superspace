/**
 * Three Column Layout Hooks
 */

"use client"

import * as React from "react"

/**
 * Persisted state hook with localStorage
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  enabled: boolean
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(defaultValue)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    if (!enabled) return
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setState(JSON.parse(stored))
      }
    } catch {
      // Ignore storage errors
    }
  }, [key, enabled])

  React.useEffect(() => {
    if (!enabled || !isHydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
  }, [key, state, enabled, isHydrated])

  return [state, setState]
}

/**
 * Responsive collapse hook
 */
export function useResponsiveCollapse(
  collapseAt: number | undefined,
  externalCollapsed: boolean | undefined,
  onCollapsedChange: ((collapsed: boolean) => void) | undefined
) {
  const [autoCollapsed, setAutoCollapsed] = React.useState(false)
  
  // Use refs to avoid infinite loops from callbacks in dependency array
  const callbackRef = React.useRef(onCollapsedChange)
  const autoCollapsedRef = React.useRef(autoCollapsed)
  
  // Keep refs updated
  React.useEffect(() => {
    callbackRef.current = onCollapsedChange
  }, [onCollapsedChange])
  
  React.useEffect(() => {
    autoCollapsedRef.current = autoCollapsed
  }, [autoCollapsed])

  React.useEffect(() => {
    if (!collapseAt || typeof window === "undefined") return

    const handleResize = () => {
      const shouldCollapse = window.innerWidth < collapseAt
      if (shouldCollapse !== autoCollapsedRef.current) {
        setAutoCollapsed(shouldCollapse)
        if (externalCollapsed === undefined) {
          callbackRef.current?.(shouldCollapse)
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [collapseAt, externalCollapsed]) // Remove autoCollapsed and onCollapsedChange from deps

  return autoCollapsed
}

/**
 * Stacked layout hook for mobile
 */
export function useStackedLayout(stackAt: number | undefined) {
  const [isStacked, setIsStacked] = React.useState(false)

  React.useEffect(() => {
    if (!stackAt || typeof window === "undefined") return

    const handleResize = () => {
      setIsStacked(window.innerWidth < stackAt)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [stackAt])

  return isStacked
}
