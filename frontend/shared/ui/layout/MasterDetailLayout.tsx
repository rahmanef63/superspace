"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * MasterDetailLayout - Generic layout for list/detail split views
 *
 * Handles responsive behavior:
 * - Desktop: Shows both list and detail side-by-side
 * - Mobile: Shows either list OR detail (not both)
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
interface MasterDetailLayoutProps {
  /** The list/sidebar view component */
  listView: React.ReactNode
  /** The detail/main content view component */
  detailView: React.ReactNode
  /** Whether an item is currently selected (affects mobile display) */
  hasSelection: boolean
  /** Additional CSS classes for the container */
  className?: string
  /** Custom width for the list view (desktop only) */
  listWidth?: string
}

export function MasterDetailLayout({
  listView,
  detailView,
  hasSelection,
  className,
  listWidth = "lg:w-[320px]",
}: MasterDetailLayoutProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    // Mobile: Show either list or detail, not both
    return (
      <div className={cn("h-full w-full", className)}>
        {hasSelection ? detailView : listView}
      </div>
    )
  }

  // Desktop: Show both side-by-side
  return (
    <div className={cn("flex h-full w-full", className)}>
      <div className={cn("border-r border-border", listWidth)}>
        {listView}
      </div>
      <div className="flex-1">
        {detailView}
      </div>
    </div>
  )
}

export default MasterDetailLayout
