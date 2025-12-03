/**
 * View Toolbar Component
 * 
 * Toolbar for view controls: view switcher, search, filters, sorting.
 * Integrates with ViewProvider context and Header system.
 */

"use client"

import * as React from "react"
import {
  Table,
  List,
  Grid3x3,
  LayoutGrid,
  Kanban,
  Calendar,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup } from "@/components/ui/toggle-group"

import { useViewContext, useViewActions } from "./provider"
import { ViewType, type ViewFilter, type ViewSort } from "./types"

// ============================================================================
// View Switcher
// ============================================================================

export interface ViewSwitcherOption {
  type: ViewType | string
  label: string
  icon: LucideIcon
  disabled?: boolean
}

export const DEFAULT_VIEW_OPTIONS: ViewSwitcherOption[] = [
  { type: ViewType.TABLE, label: "Table", icon: Table },
  { type: ViewType.LIST, label: "List", icon: List },
  { type: ViewType.GRID, label: "Grid", icon: Grid3x3 },
  { type: ViewType.KANBAN, label: "Kanban", icon: Kanban },
  { type: ViewType.CALENDAR, label: "Calendar", icon: Calendar },
]

export interface ViewSwitcherProps {
  /** Available view options */
  options?: ViewSwitcherOption[]
  /** Variant style */
  variant?: "toggle" | "dropdown" | "buttons"
  /** Size */
  size?: "sm" | "default" | "lg"
  /** Show labels */
  showLabels?: boolean
  /** Additional className */
  className?: string
  /** Controlled value (if not using context) */
  value?: ViewType | string
  /** Change handler (if not using context) */
  onChange?: (value: ViewType | string) => void
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  options = DEFAULT_VIEW_OPTIONS,
  variant = "toggle",
  size = "default",
  showLabels = false,
  className,
  value,
  onChange,
}) => {
  const context = React.useContext(ViewContext)
  const currentView = value ?? context?.state?.activeView ?? ViewType.TABLE
  
  const handleChange = (newView: ViewType | string) => {
    if (onChange) {
      onChange(newView)
    } else if (context?.actions) {
      context.actions.setView(newView as ViewType)
    }
  }

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  if (variant === "dropdown") {
    const currentOption = options.find(o => o.type === currentView) ?? options[0]
    const CurrentIcon = currentOption?.icon ?? Table

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className={className}>
            <CurrentIcon className={cn(iconSize, showLabels && "mr-2")} />
            {showLabels && currentOption?.label}
            <ChevronDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <DropdownMenuItem
                key={option.type}
                onClick={() => handleChange(option.type)}
                disabled={option.disabled}
              >
                <Icon className="mr-2 h-4 w-4" />
                {option.label}
                {currentView === option.type && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "buttons") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {options.map((option) => {
          const Icon = option.icon
          const isActive = currentView === option.type

          return (
            <Tooltip key={option.type}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size={size === "sm" ? "sm" : "icon"}
                  onClick={() => handleChange(option.type)}
                  disabled={option.disabled}
                  className={size === "sm" ? undefined : "h-8 w-8"}
                >
                  <Icon className={iconSize} />
                  {showLabels && <span className="ml-2">{option.label}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{option.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    )
  }

  // Toggle variant (default) - use buttons pattern since ToggleGroup uses options
  return (
    <div className={cn("flex items-center gap-0.5 rounded-lg border p-0.5", className)}>
      {options.map((option) => {
        const Icon = option.icon
        const isActive = currentView === option.type

        return (
          <Tooltip key={option.type}>
            <TooltipTrigger asChild>
              <Toggle
                pressed={isActive}
                onPressedChange={() => handleChange(option.type)}
                disabled={option.disabled}
                size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
                className={cn(
                  "data-[state=on]:bg-muted",
                  size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
                )}
              >
                <Icon className={iconSize} />
                {showLabels && <span className="ml-2">{option.label}</span>}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>{option.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

// Need to import the context
const ViewContext = React.createContext<ReturnType<typeof useViewContext> | null>(null)

// ============================================================================
// View Search
// ============================================================================

export interface ViewSearchProps {
  /** Placeholder text */
  placeholder?: string
  /** Size */
  size?: "sm" | "default" | "lg"
  /** Expandable (starts as icon) */
  expandable?: boolean
  /** Debounce delay in ms */
  debounce?: number
  /** Additional className */
  className?: string
  /** Controlled value (if not using context) */
  value?: string
  /** Change handler (if not using context) */
  onChange?: (value: string) => void
}

export const ViewSearch: React.FC<ViewSearchProps> = ({
  placeholder = "Search...",
  size = "default",
  expandable = false,
  debounce = 300,
  className,
  value,
  onChange,
}) => {
  const context = React.useContext(ViewContext)
  const [internalValue, setInternalValue] = React.useState(value ?? context?.state?.searchQuery ?? "")
  const [isExpanded, setIsExpanded] = React.useState(!expandable)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Debounced update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) {
        onChange(internalValue)
      } else if (context?.actions) {
        context.actions.setSearchQuery(internalValue)
      }
    }, debounce)

    return () => clearTimeout(timer)
  }, [internalValue, debounce, onChange, context?.actions])

  // Sync external value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleClear = () => {
    setInternalValue("")
    inputRef.current?.focus()
  }

  if (expandable && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsExpanded(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className={className}
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  const inputHeight = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-9"

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && expandable) {
            setIsExpanded(false)
            setInternalValue("")
          }
        }}
        placeholder={placeholder}
        className={cn("pl-9 pr-9", inputHeight)}
      />
      {internalValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// View Filter Button
// ============================================================================

export interface ViewFilterOption {
  id: string
  field: string
  label: string
  type: "select" | "multiselect" | "boolean" | "date" | "number"
  options?: Array<{ label: string; value: any }>
}

export interface ViewFilterButtonProps {
  /** Available filter options */
  filters?: ViewFilterOption[]
  /** Size */
  size?: "sm" | "default" | "lg"
  /** Additional className */
  className?: string
}

export const ViewFilterButton: React.FC<ViewFilterButtonProps> = ({
  filters = [],
  size = "default",
  className,
}) => {
  const context = React.useContext(ViewContext)
  const activeFilters = context?.state?.filters ?? []
  const filterCount = activeFilters.length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size={size} className={cn("gap-2", className)}>
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {filterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => context?.actions?.clearFilters()}
              >
                Clear all
              </Button>
            )}
          </div>
          <Separator />
          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No filters available
            </p>
          ) : (
            <div className="space-y-2">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2">
                  <span className="text-sm flex-1">{filter.label}</span>
                  {filter.type === "select" && filter.options && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Select
                          <ChevronDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {filter.options.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => {
                              context?.actions?.addFilter({
                                id: filter.id,
                                field: filter.field,
                                operator: "eq",
                                value: option.value,
                                label: option.label,
                              })
                            }}
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// View Sort Button
// ============================================================================

export interface ViewSortOption {
  field: string
  label: string
}

export interface ViewSortButtonProps {
  /** Available sort options */
  options?: ViewSortOption[]
  /** Size */
  size?: "sm" | "default" | "lg"
  /** Additional className */
  className?: string
}

export const ViewSortButton: React.FC<ViewSortButtonProps> = ({
  options = [],
  size = "default",
  className,
}) => {
  const context = React.useContext(ViewContext)
  const currentSort = context?.state?.sort

  const currentOption = options.find(o => o.field === currentSort?.field)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={cn("gap-2", className)}>
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort</span>
          {currentSort && currentOption && (
            <Badge variant="secondary" className="ml-1">
              {currentOption.label}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() => {
              if (currentSort?.field === option.field) {
                // Toggle direction
                context?.actions?.setSort({
                  field: option.field,
                  direction: currentSort.direction === "asc" ? "desc" : "asc",
                })
              } else {
                context?.actions?.setSort({
                  field: option.field,
                  direction: "asc",
                })
              }
            }}
          >
            {option.label}
            {currentSort?.field === option.field && (
              <span className="ml-auto text-xs text-muted-foreground">
                {currentSort.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </DropdownMenuItem>
        ))}
        {currentSort && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => context?.actions?.setSort(null)}>
              Clear sort
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// View Toolbar (Combined)
// ============================================================================

export interface ViewToolbarProps {
  /** Show view switcher */
  showViewSwitcher?: boolean
  /** View switcher options */
  viewOptions?: ViewSwitcherOption[]
  /** View switcher variant */
  viewVariant?: "toggle" | "dropdown" | "buttons"
  /** Show search */
  showSearch?: boolean
  /** Search placeholder */
  searchPlaceholder?: string
  /** Show filter button */
  showFilter?: boolean
  /** Filter options */
  filterOptions?: ViewFilterOption[]
  /** Show sort button */
  showSort?: boolean
  /** Sort options */
  sortOptions?: ViewSortOption[]
  /** Left slot (before view switcher) */
  left?: React.ReactNode
  /** Right slot (after all controls) */
  right?: React.ReactNode
  /** Size */
  size?: "sm" | "default" | "lg"
  /** Additional className */
  className?: string
}

export const ViewToolbar: React.FC<ViewToolbarProps> = ({
  showViewSwitcher = true,
  viewOptions,
  viewVariant = "toggle",
  showSearch = true,
  searchPlaceholder,
  showFilter = false,
  filterOptions,
  showSort = false,
  sortOptions,
  left,
  right,
  size = "default",
  className,
}) => {
  const padding = size === "sm" ? "px-2 py-1" : size === "lg" ? "px-6 py-3" : "px-4 py-2"

  return (
    <div className={cn("flex items-center justify-between gap-4 border-b bg-background", padding, className)}>
      <div className="flex items-center gap-2">
        {left}
        {showViewSwitcher && (
          <ViewSwitcher
            options={viewOptions}
            variant={viewVariant}
            size={size}
          />
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showSearch && (
          <ViewSearch
            placeholder={searchPlaceholder}
            size={size}
            className="w-64"
          />
        )}
        {showFilter && filterOptions && filterOptions.length > 0 && (
          <ViewFilterButton
            filters={filterOptions}
            size={size}
          />
        )}
        {showSort && sortOptions && sortOptions.length > 0 && (
          <ViewSortButton
            options={sortOptions}
            size={size}
          />
        )}
        {right}
      </div>
    </div>
  )
}
