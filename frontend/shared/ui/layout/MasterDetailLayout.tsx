"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  PANEL_WIDTH,
  SIDEBAR_CLASSES,
  CONTAINER_ROW,
  CONTAINER_ROOT,
  LAYOUT_TRANSITION,
  type PanelWidth,
} from "./tokens"

/**
 * MasterDetailLayout - Generic layout for list/detail split views
 *
 * Handles responsive behavior:
 * - Desktop: Shows both list and detail side-by-side
 * - Mobile: Shows either list OR detail (not both)
 *
 * Features:
 * - Consistent padding and spacing using layout tokens
 * - Responsive behavior with smooth transitions
 * - Configurable list width using preset sizes
 *
 * @example
 * ```tsx
 * <MasterDetailLayout
 *   listView={<MyListView />}
 *   detailView={<MyDetailView />}
 *   hasSelection={!!selectedId}
 * />
 * ```
 */
export interface MasterDetailLayoutProps {
  /** The list/sidebar view component */
  listView: React.ReactNode
  /** The detail/main content view component */
  detailView: React.ReactNode
  /** Whether an item is currently selected (affects mobile display) */
  hasSelection: boolean
  /** Additional CSS classes for the container */
  className?: string
  /** Custom width for the list view using preset or pixel value */
  listWidth?: PanelWidth | number
  /** Custom width class (overrides listWidth) */
  listWidthClass?: string
  /** Show border between panels */
  showBorder?: boolean
  /** Background for list panel */
  listBackground?: "default" | "muted" | "transparent"
  /** Header content for mobile back navigation */
  mobileHeader?: React.ReactNode
  /** Animate panel transitions */
  animate?: boolean
}

export function MasterDetailLayout({
  listView,
  detailView,
  hasSelection,
  className,
  listWidth = "default",
  listWidthClass,
  showBorder = true,
  listBackground = "muted",
  mobileHeader,
  animate = true,
}: MasterDetailLayoutProps) {
  const isMobile = useIsMobile()

  // Calculate width
  const width = typeof listWidth === "number" 
    ? listWidth 
    : PANEL_WIDTH[listWidth]
  
  const widthStyle = listWidthClass ? undefined : { width }

  if (isMobile) {
    // Mobile: Show either list or detail, not both
    return (
      <div className={cn(CONTAINER_ROOT, animate && LAYOUT_TRANSITION.default, className)}>
        {mobileHeader}
        <div className="flex-1 min-h-0 overflow-hidden">
          {hasSelection ? detailView : listView}
        </div>
      </div>
    )
  }

  // Desktop: Show both side-by-side
  return (
    <div className={cn(CONTAINER_ROW, className)}>
      {/* List Panel */}
      <div 
        className={cn(
          SIDEBAR_CLASSES.left,
          showBorder && "border-r",
          !showBorder && "border-r-0",
          listBackground === "transparent" && "bg-transparent",
          listBackground === "default" && "bg-background",
          animate && LAYOUT_TRANSITION.default,
          listWidthClass
        )}
        style={widthStyle}
      >
        <div className="h-full overflow-auto">
          {listView}
        </div>
      </div>
      
      {/* Detail Panel */}
      <div className={cn(SIDEBAR_CLASSES.center)}>
        <div className="h-full overflow-auto">
          {detailView}
        </div>
      </div>
    </div>
  )
}

export default MasterDetailLayout
