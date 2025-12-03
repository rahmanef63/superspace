/**
 * ViewHeader Component
 * 
 * Combines Header system with ViewToolbar for data view pages.
 * Provides a consistent header + toolbar pattern for views.
 * 
 * @example
 * ```tsx
 * <ViewProvider data={tasks} config={config}>
 *   <ViewHeader
 *     title="Tasks"
 *     subtitle="Manage your tasks"
 *     icon={CheckSquare}
 *     viewOptions={[
 *       { type: ViewType.TABLE, label: "Table", icon: Table },
 *       { type: ViewType.KANBAN, label: "Kanban", icon: Kanban },
 *     ]}
 *     showSearch
 *     showFilters
 *     actions={[{ label: "Add Task", icon: Plus, onClick: handleAdd }]}
 *   />
 *   <ViewRenderer className="flex-1" />
 * </ViewProvider>
 * ```
 */

"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { 
  Header, 
  HeaderSection,
  HeaderTitle,
  HeaderActions,
  HeaderBadge,
  type HeaderAction,
  type HeaderSize,
  type HeaderBadgeConfig,
} from "../header"
import { 
  ViewSwitcher, 
  ViewSearch, 
  ViewFilterButton, 
  ViewSortButton,
  type ViewSwitcherOption,
  type ViewSwitcherProps,
  type ViewSearchProps,
  type ViewFilterButtonProps,
  type ViewSortButtonProps,
} from "./ViewToolbar"
import { useViewContext } from "./provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ============================================================================
// Types
// ============================================================================

export interface ViewHeaderAction extends HeaderAction {}

export interface ViewHeaderProps {
  /** Page title */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Optional icon */
  icon?: LucideIcon
  /** Header size */
  size?: HeaderSize
  /** Badge configuration */
  badge?: HeaderBadgeConfig
  /** Show border bottom */
  border?: boolean
  
  // View Controls
  /** View switcher options - if provided, shows view switcher */
  viewOptions?: ViewSwitcherOption[]
  /** View switcher props override */
  viewSwitcherProps?: Partial<ViewSwitcherProps>
  /** Show search input */
  showSearch?: boolean
  /** Search props override */
  searchProps?: Partial<ViewSearchProps>
  /** Show filter controls */
  showFilters?: boolean
  /** Filter props override */
  filterProps?: Partial<ViewFilterButtonProps>
  /** Show sort control */
  showSort?: boolean
  /** Sort props override */
  sortProps?: Partial<ViewSortButtonProps>
  
  // Actions
  /** Primary action button */
  primaryAction?: ViewHeaderAction
  /** Secondary action buttons */
  secondaryActions?: ViewHeaderAction[]
  /** Additional actions (shown in more menu) */
  moreActions?: ViewHeaderAction[]
  
  // Layout
  /** Toolbar position: inline with header or separate row */
  toolbarPosition?: "inline" | "below"
  /** Additional className for header */
  className?: string
  /** Additional className for toolbar */
  toolbarClassName?: string
  
  // Render props for custom sections
  /** Custom left slot content */
  leftSlot?: React.ReactNode
  /** Custom right slot content */
  rightSlot?: React.ReactNode
  /** Custom toolbar slot content */
  toolbarSlot?: React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  subtitle,
  icon,
  size = "md",
  badge,
  border = true,
  
  // View Controls
  viewOptions,
  viewSwitcherProps,
  showSearch = false,
  searchProps,
  showFilters = false,
  filterProps,
  showSort = false,
  sortProps,
  
  // Actions
  primaryAction,
  secondaryActions = [],
  moreActions = [],
  
  // Layout
  toolbarPosition = "inline",
  className,
  toolbarClassName,
  
  // Render props
  leftSlot,
  rightSlot,
  toolbarSlot,
}) => {
  // Check if we have any toolbar items
  const hasToolbar = viewOptions || showSearch || showFilters || showSort || toolbarSlot

  // Render toolbar items
  const renderToolbarItems = () => (
    <div className={cn("flex items-center gap-2", toolbarClassName)}>
      {/* View Switcher */}
      {viewOptions && (
        <ViewSwitcher
          options={viewOptions}
          variant="toggle"
          size="sm"
          {...viewSwitcherProps}
        />
      )}

      {/* Separator after view switcher */}
      {viewOptions && (showSearch || showFilters || showSort) && (
        <Separator orientation="vertical" className="h-6" />
      )}

      {/* Search */}
      {showSearch && (
        <ViewSearch
          size="sm"
          placeholder="Search..."
          {...searchProps}
        />
      )}

      {/* Filters */}
      {showFilters && (
        <ViewFilterButton
          size="sm"
          {...filterProps}
        />
      )}

      {/* Sort */}
      {showSort && (
        <ViewSortButton
          size="sm"
          {...sortProps}
        />
      )}

      {/* Custom toolbar slot */}
      {toolbarSlot}
    </div>
  )

  // Render action buttons
  const renderActions = () => (
    <div className="flex items-center gap-2">
      {/* Secondary actions */}
      {secondaryActions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id || action.label}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {Icon && <Icon className="h-4 w-4 mr-1" />}
            {action.label}
          </Button>
        )
      })}

      {/* Primary action */}
      {primaryAction && (
        <Button
          variant={primaryAction.variant || "default"}
          size="sm"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
        >
          {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-1" />}
          {primaryAction.label}
        </Button>
      )}

      {/* Custom right slot */}
      {rightSlot}
    </div>
  )

  // Inline toolbar layout
  if (toolbarPosition === "inline") {
    return (
      <Header
        variant="default"
        size={size}
        border={border}
        className={className}
      >
        <HeaderSection position="left" className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            {/* Custom left slot */}
            {leftSlot}
            
            {/* Title */}
            <HeaderTitle
              title={title}
              subtitle={subtitle}
              icon={icon}
            />

            {/* Badge */}
            {badge && <HeaderBadge {...badge} />}
          </div>
        </HeaderSection>

        <HeaderSection position="center">
          {hasToolbar && renderToolbarItems()}
        </HeaderSection>

        <HeaderSection position="right">
          {renderActions()}
        </HeaderSection>
      </Header>
    )
  }

  // Toolbar below header layout
  return (
    <div className="flex flex-col">
      {/* Header */}
      <Header
        variant="default"
        size={size}
        border={!hasToolbar && border}
        className={className}
      >
        <HeaderSection position="left" className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            {leftSlot}
            <HeaderTitle
              title={title}
              subtitle={subtitle}
              icon={icon}
            />
            {badge && <HeaderBadge {...badge} />}
          </div>
        </HeaderSection>

        <HeaderSection position="right">
          {renderActions()}
        </HeaderSection>
      </Header>

      {/* Toolbar row */}
      {hasToolbar && (
        <div className={cn(
          "flex items-center gap-4 px-4 py-2 bg-muted/30",
          border && "border-b"
        )}>
          {renderToolbarItems()}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Compound Pattern Components (for more flexibility)
// ============================================================================

export interface ViewHeaderRootProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export const ViewHeaderRoot: React.FC<ViewHeaderRootProps> = ({
  children,
  className,
  border = true,
}) => {
  return (
    <div className={cn(
      "flex flex-col",
      border && "border-b",
      className
    )}>
      {children}
    </div>
  )
}

export interface ViewHeaderContentProps {
  children: React.ReactNode
  className?: string
}

export const ViewHeaderContent: React.FC<ViewHeaderContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 px-4 py-3",
      className
    )}>
      {children}
    </div>
  )
}

export interface ViewHeaderToolbarProps {
  children: React.ReactNode
  className?: string
}

export const ViewHeaderToolbar: React.FC<ViewHeaderToolbarProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 bg-muted/30 border-t",
      className
    )}>
      {children}
    </div>
  )
}

// ============================================================================
// Exports
// ============================================================================

export default ViewHeader
