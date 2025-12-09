/**
 * Three Column Layout (Advanced)
 * 
 * A responsive three-column layout with:
 * - Collapsible left and right panels
 * - Resizable panel widths
 * - Responsive breakpoint behavior
 * - Keyboard accessibility
 * - Smooth animations
 * - Persist collapse state (optional)
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  PanelLeftOpen, 
  PanelLeftClose, 
  PanelRightOpen, 
  PanelRightClose,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { ResizeHandle } from "../ResizeHandle"
import { ThreeColumnContext } from "./context"
import { usePersistedState, useResponsiveCollapse, useStackedLayout } from "./hooks"
import { CollapseButton } from "./CollapseButton"
import { PanelHeader } from "./PanelHeader"
import { CollapsedPanel } from "./CollapsedPanel"
import type { ThreeColumnLayoutAdvancedProps } from "./types"

// Default responsive breakpoints
// Priority: Right panel collapses first, then left panel on very small screens
const DEFAULT_COLLAPSE_RIGHT_AT = 1024 // Collapse right panel first on smaller desktops
const DEFAULT_COLLAPSE_LEFT_AT = 640   // Collapse left panel only on mobile
const DEFAULT_STACK_AT = 480           // Stack on very small mobile

export function ThreeColumnLayoutAdvanced({
  left,
  center,
  right,
  className,
  // Panel widths
  leftWidth: defaultLeftWidth = 280,
  rightWidth: defaultRightWidth = 400,
  centerMinWidth = 280,
  minSideWidth = 200,
  maxSideWidth = 600,
  collapsedWidth = 40,
  // Space distribution
  spaceDistribution = "right-priority",
  // Collapse state
  leftCollapsed: controlledLeftCollapsed,
  rightCollapsed: controlledRightCollapsed,
  onLeftCollapsedChange,
  onRightCollapsedChange,
  defaultLeftCollapsed = false,
  defaultRightCollapsed = false,
  // Features
  resizable = true,
  showCollapseButtons = true,
  persistState = false,
  storageKey = "three-column-layout",
  // Labels
  leftLabel = "Left Panel",
  centerLabel = "Main Content",
  rightLabel = "Right Panel",
  // Responsive - use defaults if not provided
  collapseLeftAt = DEFAULT_COLLAPSE_LEFT_AT,
  collapseRightAt = DEFAULT_COLLAPSE_RIGHT_AT,
  stackAt = DEFAULT_STACK_AT,
}: ThreeColumnLayoutAdvancedProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Stack layout for mobile - check this FIRST
  const isStacked = useStackedLayout(stackAt)

  // Mobile navigation state (separate from desktop collapse state)
  // On mobile: 'left' = show list, 'center' = show main content, 'right' = show detail
  const [mobileView, setMobileView] = React.useState<'left' | 'center' | 'right'>('left')

  // Persisted state
  const [persistedState, setPersistedState] = usePersistedState(
    storageKey,
    { leftCollapsed: defaultLeftCollapsed, rightCollapsed: defaultRightCollapsed },
    persistState
  )

  // Internal collapse state (uncontrolled) - for DESKTOP only
  const [internalLeftCollapsed, setInternalLeftCollapsed] = React.useState(
    persistState ? persistedState.leftCollapsed : defaultLeftCollapsed
  )
  const [internalRightCollapsed, setInternalRightCollapsed] = React.useState(
    persistState ? persistedState.rightCollapsed : defaultRightCollapsed
  )

  // Auto-collapse based on responsive breakpoints - DESKTOP only
  const autoLeftCollapsed = useResponsiveCollapse(isStacked ? undefined : collapseLeftAt)
  const autoRightCollapsed = useResponsiveCollapse(isStacked ? undefined : collapseRightAt)

  // Determine actual collapse state - DESKTOP only
  const isLeftControlled = controlledLeftCollapsed !== undefined
  const isRightControlled = controlledRightCollapsed !== undefined

  const leftCollapsed = isLeftControlled 
    ? controlledLeftCollapsed 
    : (autoLeftCollapsed || internalLeftCollapsed)
  
  const rightCollapsed = isRightControlled 
    ? controlledRightCollapsed 
    : (autoRightCollapsed || internalRightCollapsed)

  // Panel widths (for resizing)
  const [leftWidth, setLeftWidth] = React.useState(defaultLeftWidth)
  const [rightWidth, setRightWidth] = React.useState(defaultRightWidth)

  // Toggle handlers
  const toggleLeft = React.useCallback(() => {
    const newValue = !leftCollapsed
    if (!isLeftControlled) {
      setInternalLeftCollapsed(newValue)
      if (persistState) {
        setPersistedState(prev => ({ ...prev, leftCollapsed: newValue }))
      }
    }
    onLeftCollapsedChange?.(newValue)
  }, [leftCollapsed, isLeftControlled, onLeftCollapsedChange, persistState, setPersistedState])

  const toggleRight = React.useCallback(() => {
    const newValue = !rightCollapsed
    if (!isRightControlled) {
      setInternalRightCollapsed(newValue)
      if (persistState) {
        setPersistedState(prev => ({ ...prev, rightCollapsed: newValue }))
      }
    }
    onRightCollapsedChange?.(newValue)
  }, [rightCollapsed, isRightControlled, onRightCollapsedChange, persistState, setPersistedState])

  // Resize handlers
  const leftResizeRef = React.useRef({ startWidth: leftWidth, startPos: 0 })
  const rightResizeRef = React.useRef({ startWidth: rightWidth, startPos: 0 })

  const handleLeftResizeStart = React.useCallback((_index: number, startPos: number) => {
    leftResizeRef.current = { startWidth: leftWidth, startPos }
  }, [leftWidth])

  const handleLeftResize = React.useCallback((delta: number) => {
    const newWidth = Math.max(minSideWidth, Math.min(maxSideWidth, leftResizeRef.current.startWidth + delta))
    setLeftWidth(newWidth)
  }, [minSideWidth, maxSideWidth])

  const handleRightResizeStart = React.useCallback((_index: number, startPos: number) => {
    rightResizeRef.current = { startWidth: rightWidth, startPos }
  }, [rightWidth])

  const handleRightResize = React.useCallback((delta: number) => {
    const newWidth = Math.max(minSideWidth, Math.min(maxSideWidth, rightResizeRef.current.startWidth - delta))
    setRightWidth(newWidth)
  }, [minSideWidth, maxSideWidth])

  const handleResizeEnd = React.useCallback(() => {
    // Could persist sizes here if needed
  }, [])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        toggleLeft()
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "B") {
        e.preventDefault()
        toggleRight()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggleLeft, toggleRight])

  // Context value
  const contextValue = React.useMemo(() => ({
    leftCollapsed,
    rightCollapsed,
    toggleLeft,
    toggleRight,
  }), [leftCollapsed, rightCollapsed, toggleLeft, toggleRight])

  // Mobile stacked layout - full screen navigation with back/forward
  if (isStacked) {
    // Mobile navigation handlers
    const goToCenter = () => setMobileView('center')
    const goToLeft = () => setMobileView('left')
    const goToRight = () => setMobileView('right')

    // Also update context for external components that might use toggleLeft/toggleRight
    const mobileContextValue = {
      leftCollapsed: mobileView !== 'left',
      rightCollapsed: mobileView !== 'right',
      toggleLeft: mobileView === 'left' ? goToCenter : goToLeft,
      toggleRight: mobileView === 'right' ? goToCenter : goToRight,
    }

    return (
      <ThreeColumnContext.Provider value={mobileContextValue}>
        <div 
          ref={containerRef}
          className={cn("relative flex flex-col w-full h-full overflow-hidden", className)}
        >
          {/* LEFT PANEL - Full screen list view */}
          {mobileView === 'left' && (
            <div className="absolute inset-0 flex flex-col bg-background z-10">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-shrink-0">
                <span className="text-base font-semibold">{leftLabel}</span>
              </div>
              {/* Content - clicking items should call goToCenter via toggleLeft from context */}
              <div className="flex-1 overflow-auto">
                {left}
              </div>
            </div>
          )}

          {/* CENTER PANEL - Full screen main content with back button */}
          {mobileView === 'center' && (
            <div className="absolute inset-0 flex flex-col bg-background z-20">
              {/* Header with back button */}
              <div className="flex items-center gap-3 px-2 py-2 border-b bg-muted/30 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToLeft}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-base font-semibold flex-1">{centerLabel}</span>
                {right && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToRight}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto">
                {center}
              </div>
            </div>
          )}

          {/* RIGHT PANEL - Full screen detail view with back button */}
          {mobileView === 'right' && right && (
            <div className="absolute inset-0 flex flex-col bg-background z-30">
              {/* Header with back button */}
              <div className="flex items-center gap-3 px-2 py-2 border-b bg-muted/30 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToCenter}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-base font-semibold flex-1">{rightLabel}</span>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto">
                {right}
              </div>
            </div>
          )}
        </div>
      </ThreeColumnContext.Provider>
    )
  }

  // Normal three-column layout
  return (
    <ThreeColumnContext.Provider value={contextValue}>
      <div 
        ref={containerRef}
        className={cn("relative flex flex-row w-full h-full overflow-hidden", className)}
      >
        {/* Left Panel */}
        <div
          className={cn(
            "flex flex-col h-full border-r transition-all duration-200 ease-in-out flex-shrink-0",
            leftCollapsed && "border-r-0"
          )}
          style={{ 
            width: leftCollapsed ? collapsedWidth : leftWidth,
            minWidth: leftCollapsed ? collapsedWidth : minSideWidth,
            maxWidth: leftCollapsed ? collapsedWidth : maxSideWidth,
          }}
          data-collapsed={leftCollapsed}
          aria-label={leftLabel}
        >
          {leftCollapsed ? (
            <CollapsedPanel
              side="left"
              label={leftLabel}
              onClick={toggleLeft}
              width={collapsedWidth}
            />
          ) : (
            <>
              {showCollapseButtons && (
                <PanelHeader
                  side="left"
                  collapsed={leftCollapsed}
                  onToggle={toggleLeft}
                  label={leftLabel}
                  showButton={showCollapseButtons}
                >
                  {leftLabel}
                </PanelHeader>
              )}
              <div className="flex-1 overflow-auto">
                {left}
              </div>
            </>
          )}
        </div>

        {/* Left Resize Handle */}
        {resizable && !leftCollapsed && (
          <ResizeHandle
            direction="vertical"
            index={0}
            onResizeStart={handleLeftResizeStart}
            onResize={handleLeftResize}
            onResizeEnd={handleResizeEnd}
          />
        )}

        {/* Center Panel */}
        <div
          className="flex flex-col h-full overflow-hidden transition-all duration-200 flex-1"
          style={{ 
            minWidth: centerMinWidth,
            marginRight: rightCollapsed ? collapsedWidth : 0,
          }}
          aria-label={centerLabel}
        >
          <div className="flex-1 overflow-auto">
            {center}
          </div>
        </div>

        {/* Right Resize Handle */}
        {resizable && !rightCollapsed && (
          <ResizeHandle
            direction="vertical"
            index={1}
            onResizeStart={handleRightResizeStart}
            onResize={handleRightResize}
            onResizeEnd={handleResizeEnd}
          />
        )}

        {/* Right Panel */}
        <div
          className={cn(
            "flex flex-col h-full border-l transition-all duration-200 ease-in-out",
            rightCollapsed && "border-l-0 absolute right-0 top-0 bottom-0"
          )}
          style={rightCollapsed ? {
            width: collapsedWidth,
          } : {
            width: rightWidth,
            minWidth: minSideWidth,
            maxWidth: maxSideWidth,
            flexShrink: 0,
          }}
          data-collapsed={rightCollapsed}
          aria-label={rightLabel}
        >
          {rightCollapsed ? (
            <CollapsedPanel
              side="right"
              label={rightLabel}
              onClick={toggleRight}
              width={collapsedWidth}
            />
          ) : (
            <>
              {showCollapseButtons && (
                <PanelHeader
                  side="right"
                  collapsed={rightCollapsed}
                  onToggle={toggleRight}
                  label={rightLabel}
                  showButton={showCollapseButtons}
                >
                  {rightLabel}
                </PanelHeader>
              )}
              <div className="flex-1 overflow-auto">
                {right}
              </div>
            </>
          )}
        </div>
      </div>
    </ThreeColumnContext.Provider>
  )
}
