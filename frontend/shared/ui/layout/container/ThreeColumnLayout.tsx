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
import { 
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ResizeHandle } from "./ResizeHandle"

// ============================================================================
// Types
// ============================================================================

export interface ThreeColumnLayoutAdvancedProps {
  /** Left panel content */
  left: React.ReactNode
  /** Center panel content (main content area) */
  center: React.ReactNode
  /** Right panel content */
  right: React.ReactNode
  /** Additional class names for the container */
  className?: string
  
  // Panel Configuration
  /** Left panel default width */
  leftWidth?: number
  /** Right panel default width */
  rightWidth?: number
  /** Center panel minimum width (prevents squishing) */
  centerMinWidth?: number
  /** Minimum width for side panels */
  minSideWidth?: number
  /** Maximum width for side panels */
  maxSideWidth?: number
  /** Width when collapsed */
  collapsedWidth?: number
  
  // Size Distribution (when panels collapse)
  /** How to distribute space: 'center-priority' gives most to center, 'right-priority' to right */
  spaceDistribution?: "center-priority" | "right-priority" | "equal"
  
  // Collapse State
  /** Whether left panel is collapsed (controlled) */
  leftCollapsed?: boolean
  /** Whether right panel is collapsed (controlled) */
  rightCollapsed?: boolean
  /** Callback when left panel collapse state changes */
  onLeftCollapsedChange?: (collapsed: boolean) => void
  /** Callback when right panel collapse state changes */
  onRightCollapsedChange?: (collapsed: boolean) => void
  /** Default left collapsed state */
  defaultLeftCollapsed?: boolean
  /** Default right collapsed state */
  defaultRightCollapsed?: boolean
  
  // Features
  /** Enable resizable panels */
  resizable?: boolean
  /** Show collapse buttons */
  showCollapseButtons?: boolean
  /** Persist collapse state to localStorage */
  persistState?: boolean
  /** Storage key for persisting state */
  storageKey?: string
  
  // Labels
  /** Left panel label (for accessibility) */
  leftLabel?: string
  /** Center panel label */
  centerLabel?: string
  /** Right panel label */
  rightLabel?: string
  
  // Responsive
  /** Breakpoint to collapse left panel automatically (px) */
  collapseLeftAt?: number
  /** Breakpoint to collapse right panel automatically (px) */
  collapseRightAt?: number
  /** Breakpoint to stack vertically (px) */
  stackAt?: number
}

// ============================================================================
// Hooks
// ============================================================================

function usePersistedState<T>(
  key: string,
  defaultValue: T,
  enabled: boolean
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Always use default value on initial render to avoid hydration mismatch
  const [state, setState] = React.useState<T>(defaultValue)
  const [isHydrated, setIsHydrated] = React.useState(false)

  // Hydrate from localStorage after mount
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

  // Persist to localStorage when state changes (after hydration)
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

function useResponsiveCollapse(
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
        // Only trigger callback if not externally controlled
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

function useStackedLayout(stackAt: number | undefined) {
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

// ============================================================================
// Collapse Button Component
// ============================================================================

interface CollapseButtonProps {
  side: "left" | "right"
  collapsed: boolean
  onClick: () => void
  label?: string
}

function CollapseButton({ side, collapsed, onClick, label }: CollapseButtonProps) {
  const Icon = side === "left"
    ? (collapsed ? PanelLeftOpen : PanelLeftClose)
    : (collapsed ? PanelRightOpen : PanelRightClose)

  const tooltipText = collapsed
    ? `Expand ${label || side} panel`
    : `Collapse ${label || side} panel`

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-md",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent",
              "transition-colors duration-150"
            )}
            onClick={onClick}
            aria-label={tooltipText}
            aria-expanded={!collapsed}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side === "left" ? "right" : "left"}>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Panel Header (for collapsed state)
// ============================================================================

interface PanelHeaderProps {
  side: "left" | "right"
  collapsed: boolean
  onToggle: () => void
  label?: string
  showButton: boolean
  children?: React.ReactNode
}

function PanelHeader({ 
  side, 
  collapsed, 
  onToggle, 
  label, 
  showButton,
  children 
}: PanelHeaderProps) {
  return (
    <div className={cn(
      "flex items-center h-10 px-2 border-b",
      "bg-muted/30",
      side === "left" ? "justify-between" : "flex-row-reverse justify-between"
    )}>
      {showButton && (
        <CollapseButton
          side={side}
          collapsed={collapsed}
          onClick={onToggle}
          label={label}
        />
      )}
      {!collapsed && children && (
        <div className="flex-1 truncate px-2 text-sm font-medium">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Collapsed Panel Indicator
// ============================================================================

interface CollapsedPanelProps {
  side: "left" | "right"
  label?: string
  onClick: () => void
  width: number
}

function CollapsedPanel({ side, label, onClick, width }: CollapsedPanelProps) {
  const Icon = side === "left" ? PanelLeftOpen : PanelRightOpen

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-2",
              "h-full bg-muted/30 hover:bg-muted/50",
              // Left panel has border on right, Right panel has border on left
              side === "left" ? "border-r border-border" : "border-l border-border",
              "transition-colors duration-150",
              "cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            )}
            style={{ width }}
            onClick={onClick}
            aria-label={`Expand ${label || side} panel`}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label && (
              <span 
                className="text-xs text-muted-foreground font-medium"
                style={{ 
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: side === "left" ? "rotate(180deg)" : "none"
                }}
              >
                {label}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side === "left" ? "right" : "left"}>
          <p>Expand {label || side} panel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Main Component
// ============================================================================

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
    // For right panel, delta is inverted
    const newWidth = Math.max(minSideWidth, Math.min(maxSideWidth, rightResizeRef.current.startWidth - delta))
    setRightWidth(newWidth)
  }, [minSideWidth, maxSideWidth])

  const handleResizeEnd = React.useCallback(() => {
    // Could persist sizes here if needed
  }, [])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B to toggle left panel
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        toggleLeft()
      }
      // Cmd/Ctrl + Shift + B to toggle right panel
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "B") {
        e.preventDefault()
        toggleRight()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggleLeft, toggleRight])

  // Stacked layout for mobile
  if (isStacked) {
    return (
      <div 
        ref={containerRef}
        className={cn("flex flex-col w-full h-full", className)}
      >
        {/* Left panel at top when stacked */}
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

        {/* Center is main content */}
        <div className="flex-1 overflow-auto">
          {center}
        </div>

        {/* Right panel at bottom when stacked */}
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

        {/* Floating buttons when stacked and collapsed */}
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
    )
  }

  // Normal three-column layout
  // Layout uses relative positioning with the right collapsed panel
  // being positioned at the right edge of the container
  
  return (
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

      {/* Center Panel - always flex: 1 to fill available space */}
      <div
        className="flex flex-col h-full overflow-hidden transition-all duration-200 flex-1"
        style={{ 
          minWidth: centerMinWidth,
          // Account for right collapsed panel width in margin
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
  )
}

// ============================================================================
// Context for nested components
// ============================================================================

interface ThreeColumnContextValue {
  leftCollapsed: boolean
  rightCollapsed: boolean
  toggleLeft: () => void
  toggleRight: () => void
}

const ThreeColumnContext = React.createContext<ThreeColumnContextValue | null>(null)

export function useThreeColumnLayout() {
  const context = React.useContext(ThreeColumnContext)
  if (!context) {
    throw new Error("useThreeColumnLayout must be used within ThreeColumnLayoutAdvanced")
  }
  return context
}

// ============================================================================
// Compound Components for more flexibility
// ============================================================================

interface LeftPanelProps {
  children: React.ReactNode
  className?: string
}

export function LeftPanel({ children, className }: LeftPanelProps) {
  return <div className={cn("h-full", className)}>{children}</div>
}

interface CenterPanelProps {
  children: React.ReactNode
  className?: string
}

export function CenterPanel({ children, className }: CenterPanelProps) {
  return <div className={cn("h-full", className)}>{children}</div>
}

interface RightPanelProps {
  children: React.ReactNode
  className?: string
}

export function RightPanel({ children, className }: RightPanelProps) {
  return <div className={cn("h-full", className)}>{children}</div>
}
