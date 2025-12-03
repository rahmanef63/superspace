/**
 * Collapsible Panel Component
 * 
 * A panel that can be collapsed/expanded with smooth animations.
 * Shows a toggle button when collapsed for easy re-expansion.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelTopClose,
  PanelTopOpen,
  PanelBottomClose,
  PanelBottomOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// Types
// ============================================================================

export type CollapseDirection = "left" | "right" | "top" | "bottom"

export interface CollapsiblePanelProps {
  /** Panel content */
  children: React.ReactNode
  /** Direction the panel collapses to */
  direction: CollapseDirection
  /** Whether the panel is currently collapsed */
  collapsed?: boolean
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Default collapsed state (uncontrolled) */
  defaultCollapsed?: boolean
  /** Width/height when expanded */
  size?: string | number
  /** Width/height when collapsed */
  collapsedSize?: number
  /** Minimum size when expanded */
  minSize?: number
  /** Maximum size when expanded */
  maxSize?: number
  /** Additional class names */
  className?: string
  /** Panel ID for accessibility */
  id?: string
  /** Label for the panel (shown in tooltip) */
  label?: string
  /** Whether to show the collapse button */
  showCollapseButton?: boolean
  /** Position of collapse button */
  collapseButtonPosition?: "start" | "center" | "end"
  /** Custom collapse button render */
  renderCollapseButton?: (props: {
    collapsed: boolean
    toggle: () => void
    direction: CollapseDirection
  }) => React.ReactNode
}

// ============================================================================
// Icons
// ============================================================================

function getCollapseIcon(direction: CollapseDirection, collapsed: boolean) {
  const icons = {
    left: collapsed ? PanelLeftOpen : PanelLeftClose,
    right: collapsed ? PanelRightOpen : PanelRightClose,
    top: collapsed ? PanelTopOpen : PanelTopClose,
    bottom: collapsed ? PanelBottomOpen : PanelBottomClose,
  }
  return icons[direction]
}

function getChevronIcon(direction: CollapseDirection, collapsed: boolean) {
  if (direction === "left") return collapsed ? ChevronRight : ChevronLeft
  if (direction === "right") return collapsed ? ChevronLeft : ChevronRight
  if (direction === "top") return collapsed ? ChevronDown : ChevronUp
  return collapsed ? ChevronUp : ChevronDown
}

// ============================================================================
// Collapse Button
// ============================================================================

interface CollapseButtonProps {
  collapsed: boolean
  direction: CollapseDirection
  onClick: () => void
  label?: string
  position: "start" | "center" | "end"
}

function CollapseButton({
  collapsed,
  direction,
  onClick,
  label,
  position,
}: CollapseButtonProps) {
  const Icon = getCollapseIcon(direction, collapsed)
  const ChevronIcon = getChevronIcon(direction, collapsed)
  const isHorizontal = direction === "left" || direction === "right"
  
  const tooltipText = collapsed 
    ? `Expand ${label || "panel"}` 
    : `Collapse ${label || "panel"}`

  // Position classes
  const positionClasses = {
    start: isHorizontal ? "top-2" : "left-2",
    center: isHorizontal ? "top-1/2 -translate-y-1/2" : "left-1/2 -translate-x-1/2",
    end: isHorizontal ? "bottom-2" : "right-2",
  }

  // Direction-specific positioning
  const directionClasses = {
    left: "right-0 translate-x-1/2",
    right: "left-0 -translate-x-1/2",
    top: "bottom-0 translate-y-1/2",
    bottom: "top-0 -translate-y-1/2",
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute z-20",
              "h-6 w-6 rounded-full",
              "bg-background border shadow-sm",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring",
              positionClasses[position],
              directionClasses[direction]
            )}
            onClick={onClick}
            aria-label={tooltipText}
            aria-expanded={!collapsed}
          >
            <ChevronIcon className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={isHorizontal ? "top" : "left"}>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Collapsed Indicator (shown when fully collapsed)
// ============================================================================

interface CollapsedIndicatorProps {
  direction: CollapseDirection
  onClick: () => void
  label?: string
}

function CollapsedIndicator({
  direction,
  onClick,
  label,
}: CollapsedIndicatorProps) {
  const isHorizontal = direction === "left" || direction === "right"
  const Icon = getCollapseIcon(direction, true)

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center",
              "w-full h-full",
              "bg-muted/50 hover:bg-muted",
              "transition-colors duration-200",
              "cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            onClick={onClick}
            aria-label={`Expand ${label || "panel"}`}
          >
            <Icon className={cn(
              "h-4 w-4 text-muted-foreground",
              isHorizontal && "rotate-0",
              !isHorizontal && "-rotate-90"
            )} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={direction === "left" ? "right" : direction === "right" ? "left" : direction === "top" ? "bottom" : "top"}>
          <p>Expand {label || "panel"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function CollapsiblePanel({
  children,
  direction,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  defaultCollapsed = false,
  size,
  collapsedSize = 32,
  minSize,
  maxSize,
  className,
  id,
  label,
  showCollapseButton = true,
  collapseButtonPosition = "center",
  renderCollapseButton,
}: CollapsiblePanelProps) {
  // Handle controlled/uncontrolled state
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed)
  const isControlled = controlledCollapsed !== undefined
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed

  const toggle = React.useCallback(() => {
    const newValue = !collapsed
    if (!isControlled) {
      setInternalCollapsed(newValue)
    }
    onCollapsedChange?.(newValue)
  }, [collapsed, isControlled, onCollapsedChange])

  const isHorizontal = direction === "left" || direction === "right"

  // Calculate styles
  const sizeValue = typeof size === "number" ? `${size}px` : size
  const collapsedSizeValue = `${collapsedSize}px`

  const style: React.CSSProperties = {
    ...(isHorizontal 
      ? { 
          width: collapsed ? collapsedSizeValue : sizeValue,
          minWidth: collapsed ? collapsedSizeValue : minSize,
          maxWidth: collapsed ? collapsedSizeValue : maxSize,
        }
      : { 
          height: collapsed ? collapsedSizeValue : sizeValue,
          minHeight: collapsed ? collapsedSizeValue : minSize,
          maxHeight: collapsed ? collapsedSizeValue : maxSize,
        }
    ),
    transition: "all 200ms ease-in-out",
  }

  return (
    <div
      id={id}
      className={cn(
        "relative flex-shrink-0 overflow-hidden",
        className
      )}
      style={style}
      data-collapsed={collapsed}
      data-direction={direction}
    >
      {/* Collapse button */}
      {showCollapseButton && !collapsed && (
        renderCollapseButton 
          ? renderCollapseButton({ collapsed, toggle, direction })
          : (
            <CollapseButton
              collapsed={collapsed}
              direction={direction}
              onClick={toggle}
              label={label}
              position={collapseButtonPosition}
            />
          )
      )}

      {/* Content or collapsed indicator */}
      {collapsed ? (
        <CollapsedIndicator
          direction={direction}
          onClick={toggle}
          label={label}
        />
      ) : (
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
      )}
    </div>
  )
}
