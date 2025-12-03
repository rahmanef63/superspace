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

  React.useEffect(() => {
    if (!collapseAt || typeof window === "undefined") return

    const handleResize = () => {
      const shouldCollapse = window.innerWidth < collapseAt
      if (shouldCollapse !== autoCollapsed) {
        setAutoCollapsed(shouldCollapse)
        if (externalCollapsed === undefined) {
          onCollapsedChange?.(shouldCollapse)
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [collapseAt, autoCollapsed, externalCollapsed, onCollapsedChange])

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
