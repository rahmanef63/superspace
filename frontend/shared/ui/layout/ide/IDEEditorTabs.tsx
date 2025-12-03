"use client"

import * as React from "react"
import { X, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { IDEEditorTabsProps, EditorTab } from "./types"

// DnD imports - using @dnd-kit for drag and drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

/**
 * Editor Tabs Component
 * 
 * VS Code-style tabs with drag-and-drop reordering support.
 */
export function IDEEditorTabs({
  tabs,
  activeId,
  onTabClick,
  onTabClose,
  onTabReorder,
  onTabPin,
  className,
}: IDEEditorTabsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id)
      const newIndex = tabs.findIndex((tab) => tab.id === over.id)
      onTabReorder?.(oldIndex, newIndex)
    }
  }

  if (tabs.length === 0) {
    return (
      <div className={cn("h-9 border-b bg-muted/30", className)}>
        <div className="h-full flex items-center px-4 text-xs text-muted-foreground">
          No open editors
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-end border-b bg-muted/30 overflow-x-auto",
        "scrollbar-thin scrollbar-thumb-muted-foreground/20",
        className
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          {tabs.map((tab) => (
            <SortableTab
              key={tab.id}
              tab={tab}
              isActive={activeId === tab.id}
              onClick={() => onTabClick?.(tab.id)}
              onClose={() => onTabClose?.(tab.id)}
              onPin={() => onTabPin?.(tab.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SortableTabProps {
  tab: EditorTab
  isActive: boolean
  onClick: () => void
  onClose: () => void
  onPin: () => void
}

function SortableTab({
  tab,
  isActive,
  onClick,
  onClose,
  onPin,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = tab.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-1.5 h-9 px-3",
        "border-r border-border/50 cursor-pointer",
        "text-sm text-muted-foreground hover:text-foreground",
        "transition-colors select-none",
        isActive && [
          "bg-background text-foreground",
          "after:absolute after:bottom-0 after:left-0 after:right-0",
          "after:h-0.5 after:bg-primary",
        ],
        !isActive && "hover:bg-muted/50",
        isDragging && "opacity-50 z-50",
        tab.isPreview && "italic"
      )}
    >
      {/* Icon */}
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      
      {/* Title */}
      <span className="truncate max-w-32">{tab.title}</span>
      
      {/* Dirty indicator */}
      {tab.isDirty && (
        <span className="w-2 h-2 rounded-full bg-foreground" />
      )}
      
      {/* Pinned indicator */}
      {tab.isPinned && (
        <Pin className="h-3 w-3 text-muted-foreground" />
      )}
      
      {/* Close button */}
      {tab.closable !== false && !tab.isPinned && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className={cn(
            "ml-1 p-0.5 rounded-sm opacity-0 group-hover:opacity-100",
            "hover:bg-accent transition-opacity",
            isActive && "opacity-100"
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
