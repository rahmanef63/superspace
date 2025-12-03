/**
 * Tree View Component
 * 
 * Hierarchical tree view for nested data.
 * Supports expand/collapse and multi-level nesting.
 */

"use client"

import React, { useMemo, useState, useCallback } from "react"
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  File,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ViewComponentProps, ViewAction } from "../types"

interface TreeItem {
  id?: string
  _id?: string
  name?: string
  title?: string
  label?: string
  children?: TreeItem[]
  parentId?: string | null
  icon?: React.ReactNode
  type?: "folder" | "file" | string
  expanded?: boolean
  disabled?: boolean
  [key: string]: any
}

interface TreeNodeProps<T extends TreeItem> {
  item: T
  level: number
  expanded: Set<string>
  selected: Set<string>
  onToggleExpand: (id: string) => void
  onToggleSelect: (id: string) => void
  onItemClick?: (item: T) => void
  selectable?: boolean
  actions?: ViewAction[]
  getItemId: (item: T) => string
  getItemLabel: (item: T) => string
  renderItem?: (item: T) => React.ReactNode
}

function TreeNode<T extends TreeItem>({
  item,
  level,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
  onItemClick,
  selectable,
  actions,
  getItemId,
  getItemLabel,
  renderItem,
}: TreeNodeProps<T>) {
  const id = getItemId(item)
  const label = getItemLabel(item)
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expanded.has(id)
  const isSelected = selected.has(id)
  const isFolder = item.type === "folder" || hasChildren

  // Get icon for node
  const getIcon = () => {
    if (item.icon) return item.icon
    if (isFolder) {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 text-amber-500" />
      ) : (
        <Folder className="h-4 w-4 text-amber-500" />
      )
    }
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer group",
          isSelected && "bg-accent",
          item.disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={(e) => {
          if (item.disabled) return
          if (hasChildren) {
            onToggleExpand(id)
          } else if (selectable) {
            onToggleSelect(id)
          } else {
            onItemClick?.(item)
          }
        }}
      >
        {/* Expand/collapse button */}
        <div className="w-4 h-4 flex items-center justify-center">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(id)
              }}
              className="hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Selection checkbox */}
        {selectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(id)}
            onClick={(e) => e.stopPropagation()}
            disabled={item.disabled}
            className="mr-1"
          />
        )}

        {/* Icon */}
        <span className="mr-2">{getIcon()}</span>

        {/* Label */}
        <span className="flex-1 truncate text-sm">
          {renderItem ? renderItem(item) : label}
        </span>

        {/* Actions dropdown */}
        {actions && actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => {
                const isDisabled = typeof action.disabled === "function" 
                  ? action.disabled(item) 
                  : action.disabled
                const Icon = action.icon
                
                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick(item)
                    }}
                    disabled={isDisabled}
                    className={action.variant === "destructive" ? "text-destructive" : ""}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Indent line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border"
            style={{ marginLeft: `${(level + 1) * 16 + 8}px` }}
          />
          {item.children!.map((child, index) => (
            <TreeNode
              key={getItemId(child as T) || index}
              item={child as T}
              level={level + 1}
              expanded={expanded}
              selected={selected}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onItemClick={onItemClick}
              selectable={selectable}
              actions={actions}
              getItemId={getItemId}
              getItemLabel={getItemLabel}
              renderItem={renderItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView<T extends TreeItem>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand first level by default
    const initial = new Set<string>()
    data.forEach((item, index) => {
      if (item.children && item.children.length > 0) {
        initial.add(getItemId(item, index))
      }
    })
    return initial
  })

  // Get unique ID for each item
  function getItemId(item: T, index?: number): string {
    return String(item.id || item._id || index || Math.random())
  }

  // Get label for item
  function getItemLabel(item: T): string {
    const labelField = config.fields?.find(
      f => f.id === "name" || f.id === "title" || f.id === "label"
    )?.id
    return item[labelField || "name"] || item.name || item.title || item.label || "Untitled"
  }

  // Build tree from flat data with parentId
  const treeData = useMemo(() => {
    // Check if data already has children structure
    const hasChildrenStructure = data.some(item => item.children && item.children.length > 0)
    if (hasChildrenStructure) {
      return data
    }

    // Build tree from flat data with parentId
    const itemMap = new Map<string, T & { children: T[] }>()
    const roots: (T & { children: T[] })[] = []

    // First pass: create map of all items
    data.forEach((item, index) => {
      const id = getItemId(item, index)
      itemMap.set(id, { ...item, children: [] })
    })

    // Second pass: build tree structure
    data.forEach((item, index) => {
      const id = getItemId(item, index)
      const node = itemMap.get(id)!
      
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }, [data])

  // Filter tree based on search query
  const filteredTreeData = useMemo(() => {
    if (!state.searchQuery) return treeData

    const query = state.searchQuery.toLowerCase()

    const filterNode = (item: T): T | null => {
      const label = getItemLabel(item)
      const matches = label.toLowerCase().includes(query)

      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children
          .map((child) => filterNode(child as T))
          .filter(Boolean) as T[]

        if (matches || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren }
        }
      }

      return matches ? item : null
    }

    return treeData.map(filterNode).filter(Boolean) as T[]
  }, [treeData, state.searchQuery])

  // Toggle expand state
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Toggle selection
  const handleToggleSelect = useCallback((id: string) => {
    if (state.selectedIds.has(id)) {
      actions.deselectItem(id)
    } else {
      actions.selectItem(id)
    }
  }, [state.selectedIds, actions])

  // Expand all
  const expandAll = useCallback(() => {
    const allIds = new Set<string>()
    const collectIds = (items: T[]) => {
      items.forEach((item, index) => {
        if (item.children && item.children.length > 0) {
          allIds.add(getItemId(item, index))
          collectIds(item.children as T[])
        }
      })
    }
    collectIds(treeData)
    setExpandedIds(allIds)
  }, [treeData])

  // Collapse all
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  if (filteredTreeData.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 gap-4", className)}>
        <Folder className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No items found</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Button variant="ghost" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="ghost" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        {filteredTreeData.map((item, index) => (
          <TreeNode
            key={getItemId(item, index)}
            item={item}
            level={0}
            expanded={expandedIds}
            selected={state.selectedIds}
            onToggleExpand={handleToggleExpand}
            onToggleSelect={handleToggleSelect}
            onItemClick={config.onItemClick}
            selectable={config.settings?.selectable}
            actions={config.actions}
            getItemId={getItemId}
            getItemLabel={getItemLabel}
          />
        ))}
      </div>
    </div>
  )
}

export default TreeView
