/**
 * Draggable Topbar Component
 * 
 * A topbar with draggable tabs that can be reordered via drag-and-drop.
 * Useful for panel headers in multi-column layouts where users want to
 * rearrange the order of panels.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { GripVertical, X, Pin, PinOff, Maximize2, Minimize2 } from "lucide-react"
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

export interface TopbarTab {
  /** Unique identifier for the tab */
  id: string
  /** Display label */
  label: string
  /** Icon component (optional) */
  icon?: React.ComponentType<{ className?: string }>
  /** Whether this tab can be dragged */
  draggable?: boolean
  /** Whether this tab can be closed */
  closable?: boolean
  /** Whether this tab is pinned (cannot be reordered before other pinned tabs) */
  pinned?: boolean
  /** Custom render for the tab content */
  render?: (tab: TopbarTab, isActive: boolean) => React.ReactNode
}

export interface DraggableTopbarProps {
  /** Array of tabs to display */
  tabs: TopbarTab[]
  /** Currently active tab ID */
  activeTabId?: string
  /** Callback when active tab changes */
  onActiveTabChange?: (tabId: string) => void
  /** Callback when tabs are reordered */
  onTabsReorder?: (tabs: TopbarTab[]) => void
  /** Callback when a tab is closed */
  onTabClose?: (tabId: string) => void
  /** Callback when a tab is pinned/unpinned */
  onTabPin?: (tabId: string, pinned: boolean) => void
  /** Show drag handle on tabs */
  showDragHandle?: boolean
  /** Show close button on tabs */
  showCloseButton?: boolean
  /** Show pin button on tabs */
  showPinButton?: boolean
  /** Additional actions on the right side of the topbar */
  rightActions?: React.ReactNode
  /** Additional class names */
  className?: string
  /** Tab container class names */
  tabClassName?: string
  /** Accent color for drop indicators */
  accentColor?: string
}

// ============================================================================
// Drop Indicator
// ============================================================================

interface DropIndicatorProps {
  position: "left" | "right"
  accentColor: string
}

function DropIndicator({ position, accentColor }: DropIndicatorProps) {
  return (
    <div
      className={cn(
        "absolute top-1 bottom-1 w-0.5 z-50",
        position === "left" ? "left-0" : "right-0"
      )}
      style={{ backgroundColor: accentColor }}
    />
  )
}

// ============================================================================
// Tab Component
// ============================================================================

interface TabProps {
  tab: TopbarTab
  isActive: boolean
  isDragging: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  dropPosition?: "left" | "right" | null
  accentColor: string
  showDragHandle: boolean
  showCloseButton: boolean
  showPinButton: boolean
  onClick: () => void
  onClose?: () => void
  onPin?: (pinned: boolean) => void
  className?: string
}

function Tab({
  tab,
  isActive,
  isDragging,
  dragHandleProps,
  dropPosition,
  accentColor,
  showDragHandle,
  showCloseButton,
  showPinButton,
  onClick,
  onClose,
  onPin,
  className,
}: TabProps) {
  const Icon = tab.icon
  
  return (
    <div
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer",
        "transition-all duration-150 select-none",
        "hover:bg-accent/50",
        isActive && "bg-accent text-accent-foreground",
        isDragging && "opacity-50 scale-95",
        tab.pinned && "border-l-2 border-primary/50",
        className
      )}
      onClick={onClick}
      data-tab-id={tab.id}
    >
      {/* Drop indicators */}
      {dropPosition === "left" && <DropIndicator position="left" accentColor={accentColor} />}
      {dropPosition === "right" && <DropIndicator position="right" accentColor={accentColor} />}
      
      {/* Drag handle */}
      {showDragHandle && tab.draggable !== false && (
        <div
          {...dragHandleProps}
          className={cn(
            "cursor-grab active:cursor-grabbing",
            "text-muted-foreground hover:text-foreground",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}
      
      {/* Icon */}
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      
      {/* Label */}
      {tab.render ? (
        tab.render(tab, isActive)
      ) : (
        <span className="truncate text-sm font-medium">{tab.label}</span>
      )}
      
      {/* Pin indicator */}
      {tab.pinned && (
        <Pin className="h-3 w-3 text-muted-foreground shrink-0" />
      )}
      
      {/* Pin button */}
      {showPinButton && onPin && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onPin(!tab.pinned)
                }}
              >
                {tab.pinned ? (
                  <PinOff className="h-3 w-3" />
                ) : (
                  <Pin className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {tab.pinned ? "Unpin tab" : "Pin tab"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Close button */}
      {showCloseButton && tab.closable !== false && onClose && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close tab</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function DraggableTopbar({
  tabs,
  activeTabId,
  onActiveTabChange,
  onTabsReorder,
  onTabClose,
  onTabPin,
  showDragHandle = true,
  showCloseButton = false,
  showPinButton = false,
  rightActions,
  className,
  tabClassName,
  accentColor = "#3b82f6",
}: DraggableTopbarProps) {
  const [internalTabs, setInternalTabs] = React.useState(tabs)
  const [draggedTabId, setDraggedTabId] = React.useState<string | null>(null)
  const [dropPosition, setDropPosition] = React.useState<{ tabId: string; position: "left" | "right" } | null>(null)
  
  // Sync with external tabs
  React.useEffect(() => {
    setInternalTabs(tabs)
  }, [tabs])
  
  const handleDragStart = React.useCallback((e: React.DragEvent, tabId: string) => {
    const tab = internalTabs.find(t => t.id === tabId)
    if (!tab || tab.draggable === false) {
      e.preventDefault()
      return
    }
    
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", tabId)
    setDraggedTabId(tabId)
  }, [internalTabs])
  
  const handleDragOver = React.useCallback((e: React.DragEvent, tabId: string) => {
    e.preventDefault()
    if (!draggedTabId || draggedTabId === tabId) return
    
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const midpoint = rect.left + rect.width / 2
    const position = e.clientX < midpoint ? "left" : "right"
    
    setDropPosition({ tabId, position })
  }, [draggedTabId])
  
  const handleDragLeave = React.useCallback(() => {
    setDropPosition(null)
  }, [])
  
  const handleDrop = React.useCallback((e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()
    if (!draggedTabId || !dropPosition) return
    
    const draggedIndex = internalTabs.findIndex(t => t.id === draggedTabId)
    const targetIndex = internalTabs.findIndex(t => t.id === targetTabId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    // Calculate new index
    let newIndex = dropPosition.position === "left" ? targetIndex : targetIndex + 1
    if (draggedIndex < targetIndex) {
      newIndex -= 1 // Adjust for removal
    }
    
    // Check pinned constraint - cannot move non-pinned before pinned
    const draggedTab = internalTabs[draggedIndex]
    const targetTab = internalTabs[targetIndex]
    if (!draggedTab.pinned && targetTab.pinned && dropPosition.position === "left") {
      // Find first non-pinned position
      const firstNonPinnedIndex = internalTabs.findIndex(t => !t.pinned)
      if (firstNonPinnedIndex > newIndex) {
        newIndex = firstNonPinnedIndex
      }
    }
    
    // Reorder
    const newTabs = [...internalTabs]
    const [removed] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(newIndex, 0, removed)
    
    setInternalTabs(newTabs)
    onTabsReorder?.(newTabs)
    
    setDraggedTabId(null)
    setDropPosition(null)
  }, [draggedTabId, dropPosition, internalTabs, onTabsReorder])
  
  const handleDragEnd = React.useCallback(() => {
    setDraggedTabId(null)
    setDropPosition(null)
  }, [])
  
  return (
    <div 
      className={cn(
        "flex items-center h-10 px-2 gap-1 border-b bg-muted/30",
        "overflow-x-auto scrollbar-thin",
        className
      )}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 flex-1">
        {internalTabs.map((tab) => (
          <div
            key={tab.id}
            className="group relative"
            draggable={tab.draggable !== false}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
          >
            <Tab
              tab={tab}
              isActive={activeTabId === tab.id}
              isDragging={draggedTabId === tab.id}
              dropPosition={dropPosition?.tabId === tab.id ? dropPosition.position : null}
              accentColor={accentColor}
              showDragHandle={showDragHandle}
              showCloseButton={showCloseButton}
              showPinButton={showPinButton}
              onClick={() => onActiveTabChange?.(tab.id)}
              onClose={onTabClose ? () => onTabClose(tab.id) : undefined}
              onPin={onTabPin ? (pinned) => onTabPin(tab.id, pinned) : undefined}
              className={tabClassName}
            />
          </div>
        ))}
      </div>
      
      {/* Right actions */}
      {rightActions && (
        <div className="flex items-center gap-1 shrink-0">
          {rightActions}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Panel Topbar Variant
// ============================================================================

export interface PanelTopbarProps {
  /** Panel title */
  title: string
  /** Panel icon */
  icon?: React.ComponentType<{ className?: string }>
  /** Is panel maximized */
  isMaximized?: boolean
  /** Is panel collapsed */
  isCollapsed?: boolean
  /** Toggle maximize callback */
  onMaximize?: () => void
  /** Toggle collapse callback */  
  onCollapse?: () => void
  /** Close panel callback */
  onClose?: () => void
  /** Drag handle for reordering */
  draggable?: boolean
  /** Additional actions */
  actions?: React.ReactNode
  /** Additional class names */
  className?: string
}

export function PanelTopbar({
  title,
  icon: Icon,
  isMaximized = false,
  isCollapsed = false,
  onMaximize,
  onCollapse,
  onClose,
  draggable = true,
  actions,
  className,
}: PanelTopbarProps) {
  return (
    <div 
      className={cn(
        "flex items-center h-9 px-2 gap-2 border-b bg-muted/30",
        "select-none",
        className
      )}
    >
      {/* Drag handle */}
      {draggable && (
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      
      {/* Icon */}
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      
      {/* Title */}
      <span className="flex-1 truncate text-sm font-medium">{title}</span>
      
      {/* Custom actions */}
      {actions}
      
      {/* Built-in actions */}
      <div className="flex items-center gap-0.5">
        {onMaximize && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onMaximize}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMaximized ? "Restore" : "Maximize"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {onClose && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onClose}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
