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
import { cn } from "@/lib/utils"
import { ResizeHandle } from "../ResizeHandle"
import { ThreeColumnContext } from "./context"
import { usePersistedState, useResponsiveCollapse, useStackedLayout } from "./hooks"
import { CollapseButton } from "./CollapseButton"
import { PanelHeader } from "./PanelHeader"
import { CollapsedPanel } from "./CollapsedPanel"
import type { ThreeColumnLayoutAdvancedProps } from "./types"

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
  // Responsive
  collapseLeftAt,
  collapseRightAt,
  stackAt,
}: ThreeColumnLayoutAdvancedProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Persisted state
  const [persistedState, setPersistedState] = usePersistedState(
    storageKey,
    { leftCollapsed: defaultLeftCollapsed, rightCollapsed: defaultRightCollapsed },
    persistState
  )

  // Internal collapse state (uncontrolled)
  const [internalLeftCollapsed, setInternalLeftCollapsed] = React.useState(
    persistState ? persistedState.leftCollapsed : defaultLeftCollapsed
  )
  const [internalRightCollapsed, setInternalRightCollapsed] = React.useState(
    persistState ? persistedState.rightCollapsed : defaultRightCollapsed
  )

  // Auto-collapse based on responsive breakpoints
  const autoLeftCollapsed = useResponsiveCollapse(
    collapseLeftAt,
    controlledLeftCollapsed,
    onLeftCollapsedChange
  )
  const autoRightCollapsed = useResponsiveCollapse(
    collapseRightAt,
    controlledRightCollapsed,
    onRightCollapsedChange
  )

  // Stack layout for mobile
  const isStacked = useStackedLayout(stackAt)

  // Determine actual collapse state
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
  }, [leftCollapsed, isLeftControlled, persistState, setPersistedState, onLeftCollapsedChange])

  const toggleRight = React.useCallback(() => {
    const newValue = !rightCollapsed
    if (!isRightControlled) {
      setInternalRightCollapsed(newValue)
      if (persistState) {
        setPersistedState(prev => ({ ...prev, rightCollapsed: newValue }))
      }
    }
    onRightCollapsedChange?.(newValue)
  }, [rightCollapsed, isRightControlled, persistState, setPersistedState, onRightCollapsedChange])

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

  // Stacked layout for mobile
  if (isStacked) {
    return (
      <ThreeColumnContext.Provider value={contextValue}>
        <div 
          ref={containerRef}
          className={cn("flex flex-col w-full h-full", className)}
        >
          {!leftCollapsed && (
            <div className="border-b" style={{ height: "auto", maxHeight: "30vh" }}>
              <PanelHeader
                side="left"
                collapsed={leftCollapsed}
                onToggle={toggleLeft}
                label={leftLabel}
                showButton={showCollapseButtons}
              />
              <div className="overflow-auto" style={{ height: "calc(100% - 40px)" }}>
                {left}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            {center}
          </div>

          {!rightCollapsed && (
            <div className="border-t" style={{ height: "auto", maxHeight: "30vh" }}>
              <PanelHeader
                side="right"
                collapsed={rightCollapsed}
                onToggle={toggleRight}
                label={rightLabel}
                showButton={showCollapseButtons}
              />
              <div className="overflow-auto" style={{ height: "calc(100% - 40px)" }}>
                {right}
              </div>
            </div>
          )}

          {(leftCollapsed || rightCollapsed) && (
            <div className="fixed bottom-4 right-4 flex gap-2 z-50">
              {leftCollapsed && showCollapseButtons && (
                <CollapseButton
                  side="left"
                  collapsed={true}
                  onClick={toggleLeft}
                  label={leftLabel}
                />
              )}
              {rightCollapsed && showCollapseButtons && (
                <CollapseButton
                  side="right"
                  collapsed={true}
                  onClick={toggleRight}
                  label={rightLabel}
                />
              )}
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
