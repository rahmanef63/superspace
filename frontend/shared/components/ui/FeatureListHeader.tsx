"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * FeatureListHeader - Reusable header for list views
 *
 * Displays title, optional add button, and search functionality
 *
 * @example
 * ```tsx
 * <FeatureListHeader
 *   title="AI Chats"
 *   onAddClick={() => createNewChat()}
 *   searchPlaceholder="Search AI chats..."
 *   searchValue={query}
 *   onSearchChange={setQuery}
 * />
 * ```
 */
interface FeatureListHeaderProps {
  /** Title to display in the header */
  title: string
  /** Callback when add button is clicked */
  onAddClick?: () => void
  /** Placeholder text for search input */
  searchPlaceholder?: string
  /** Current search value */
  searchValue?: string
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void
  /** Whether to show the add button */
  showAddButton?: boolean
  /** Custom add button icon */
  addButtonIcon?: React.ReactNode
  /** Custom search component */
  searchComponent?: React.ReactNode
  /** Additional CSS classes for the container */
  className?: string
}

export function FeatureListHeader({
  title,
  onAddClick,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  showAddButton = true,
  addButtonIcon,
  searchComponent,
  className,
}: FeatureListHeaderProps) {
  const isMobile = useIsMobile()

  return (
    <div className={cn("p-4 border-b border-border bg-card", className)}>
      {/* Title and Add Button Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger />}
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>
        {showAddButton && onAddClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddClick}
            className="hover:bg-accent"
          >
            {addButtonIcon || <Plus className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Search Component */}
      {searchComponent ? (
        searchComponent
      ) : onSearchChange ? (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      ) : null}
    </div>
  )
}
