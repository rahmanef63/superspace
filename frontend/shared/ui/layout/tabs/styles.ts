/**
 * Tabs Styling Utilities
 * 
 * CSS class generators for different tab variants and states.
 */

import { cn } from "@/lib/utils"
import type { TabVariant, TabSize, TabOrientation, TabAlignment } from "./types"

// ============================================================================
// Base Classes
// ============================================================================

/**
 * Get classes for tabs container
 */
export function getTabsContainerClasses(
  orientation: TabOrientation,
  className?: string
) {
  return cn(
    "flex",
    orientation === "horizontal" ? "flex-col" : "flex-row",
    className
  )
}

/**
 * Get classes for tabs list (the row/column of tab triggers)
 */
export function getTabsListClasses(
  variant: TabVariant,
  size: TabSize,
  orientation: TabOrientation,
  alignment: TabAlignment,
  fullWidth?: boolean,
  className?: string
) {
  const base = cn(
    "flex",
    orientation === "horizontal" ? "flex-row" : "flex-col",
    // Gap between tabs
    size === "sm" && "gap-1",
    size === "md" && "gap-1.5",
    size === "lg" && "gap-2",
  )

  const alignmentClasses = {
    start: orientation === "horizontal" ? "justify-start" : "items-start",
    center: orientation === "horizontal" ? "justify-center" : "items-center",
    end: orientation === "horizontal" ? "justify-end" : "items-end",
    stretch: orientation === "horizontal" ? "w-full" : "h-full",
  }

  const variantClasses = {
    default: cn(
      "border-b border-border",
      orientation === "vertical" && "border-b-0 border-r"
    ),
    pills: "p-1 bg-muted rounded-lg",
    underline: cn(
      "border-b border-border",
      orientation === "vertical" && "border-b-0 border-r"
    ),
    boxed: "border border-border rounded-lg p-1 bg-muted/30",
    segment: "p-1 bg-muted rounded-lg",
    minimal: "",
  }

  return cn(
    base,
    alignmentClasses[alignment],
    variantClasses[variant],
    fullWidth && "w-full",
    className
  )
}

/**
 * Get classes for individual tab trigger
 */
export function getTabTriggerClasses(
  variant: TabVariant,
  size: TabSize,
  orientation: TabOrientation,
  isActive: boolean,
  isDisabled?: boolean,
  className?: string
) {
  // Base classes
  const base = cn(
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
    !isDisabled && "cursor-pointer",
  )

  // Size classes
  const sizeClasses = {
    sm: cn(
      "text-xs",
      orientation === "horizontal" ? "px-2.5 py-1.5" : "px-3 py-1.5 w-full"
    ),
    md: cn(
      "text-sm",
      orientation === "horizontal" ? "px-3 py-2" : "px-4 py-2 w-full"
    ),
    lg: cn(
      "text-base",
      orientation === "horizontal" ? "px-4 py-2.5" : "px-5 py-2.5 w-full"
    ),
  }

  // Variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return cn(
          "border-b-2 -mb-px",
          orientation === "vertical" && "border-b-0 border-r-2 -mr-px",
          isActive
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
        )
      
      case "pills":
        return cn(
          "rounded-md",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )
      
      case "underline":
        return cn(
          "border-b-2 -mb-px rounded-none",
          orientation === "vertical" && "border-b-0 border-r-2 -mr-px",
          isActive
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )
      
      case "boxed":
        return cn(
          "rounded-md border",
          isActive
            ? "border-border bg-background text-foreground shadow-sm"
            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/50"
        )
      
      case "segment":
        return cn(
          "rounded-md flex-1",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )
      
      case "minimal":
        return cn(
          "rounded-md",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )
      
      default:
        return ""
    }
  }

  return cn(base, sizeClasses[size], getVariantClasses(), className)
}

/**
 * Get classes for tab panel (content area)
 */
export function getTabPanelClasses(
  orientation: TabOrientation,
  className?: string
) {
  return cn(
    "flex-1",
    orientation === "horizontal" ? "pt-4" : "pl-4",
    "focus-visible:outline-none",
    className
  )
}

/**
 * Get icon size based on tab size
 */
export function getIconSize(size: TabSize): number {
  const sizes = {
    sm: 14,
    md: 16,
    lg: 18,
  }
  return sizes[size]
}

/**
 * Get badge classes based on variant and state
 */
export function getBadgeClasses(
  variant: TabVariant,
  isActive: boolean,
  className?: string
) {
  return cn(
    "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
    isActive
      ? "bg-primary/20 text-primary"
      : "bg-muted-foreground/20 text-muted-foreground",
    className
  )
}
