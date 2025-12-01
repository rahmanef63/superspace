import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Copy,
  ArrowUpCircle,
  Shield,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DragDropMenuTreeProps,
  MenuTreeNode,
  DropPreview,
  ACCENT_COLORS,
  DROP_THRESHOLD,
  DEFAULT_MENU_FEATURE_CONFIG,
  type MenuItemRecord,
  type SecondaryMenuFeatureConfig
} from "../types"
import { useMenuItems } from "../hooks/useMenuItems"
import { useMenuMutations } from "../hooks/useMenuMutations"
import { useOptionalSecondaryMenuContext } from "../context"
import { buildMenuTree, computeNextOrder } from "../utils/tree"
import { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { DynamicIcon, IconPicker } from "@/frontend/shared/ui/icons"

export function DragDropMenuTree({
  workspaceId,
  onItemSelect,
  selectedItemId,
  featureConfig,
}: DragDropMenuTreeProps) {
  const context = useOptionalSecondaryMenuContext()
  const mergedConfig = useMemo<SecondaryMenuFeatureConfig>(
    () => ({
      ...DEFAULT_MENU_FEATURE_CONFIG,
      ...(context?.featureConfig ?? {}),
      ...(featureConfig ?? {}),
    }),
    [context?.featureConfig, featureConfig],
  )
  const { menuItems: fallbackMenuItems, isLoading: fallbackLoading } = useMenuItems(workspaceId)
  const { menuItems, isLoading } = context
    ? { menuItems: context.menuItems, isLoading: context.isLoading }
    : { menuItems: fallbackMenuItems, isLoading: fallbackLoading }
  const allMutations = context?.mutations ?? useMenuMutations()
  const { updateMenuItem, deleteMenuItem, duplicateMenuItem } = allMutations

  const allowDragAndDrop = mergedConfig.allowDragAndDrop
  const canRename = mergedConfig.allowRename
  const canDuplicate = mergedConfig.allowDuplicate
  const canDelete = mergedConfig.allowDelete
  const canChangeAppearance = mergedConfig.allowAppearanceChange

  const [expandedItems, setExpandedItems] = useState<Set<Id<"menuItems">>>(new Set())
  const [draggedItem, setDraggedItem] = useState<Id<"menuItems"> | null>(null)
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null)
  const [renamingItemId, setRenamingItemId] = useState<Id<"menuItems"> | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // Fetch menu updates
  const menuUpdates = useQuery((api as any)["features/menus/menuItems"].getMenuUpdates, { workspaceId }) || []
  const updatesMap = useMemo(() => {
    const map = new Map<string, { currentVersion: string; latestVersion: string }>()
    menuUpdates.forEach((update: { menuItemId: Id<"menuItems">; currentVersion: string; latestVersion: string }) => {
      map.set(String(update.menuItemId), {
        currentVersion: update.currentVersion,
        latestVersion: update.latestVersion,
      })
    })
    return map
  }, [menuUpdates])

  const flatItems = useMemo<MenuItemRecord[]>(() => {
    return menuItems
  }, [menuItems])

  const itemLookup = useMemo(() => {
    const map = new Map<string, MenuItemRecord>()
    flatItems.forEach((item) => map.set(String(item._id), item))
    return map
  }, [flatItems])

  const getNextOrder = useCallback(
    (parentId?: Id<"menuItems">) => {
      return computeNextOrder(flatItems, parentId)
    },
    [flatItems],
  )

  const tree = useMemo(() => {
    return buildMenuTree(flatItems)
  }, [flatItems])

  const toggleExpanded = (itemId: Id<"menuItems">) => {
    const next = new Set(expandedItems)
    if (next.has(itemId)) {
      next.delete(itemId)
    } else {
      next.add(itemId)
    }
    setExpandedItems(next)
  }

  const handleIconChange = async (itemId: Id<"menuItems">, newIcon: string) => {
    if (!canChangeAppearance) return
    try {
      await updateMenuItem({
        menuItemId: itemId,
        icon: newIcon,
      })
      toast.success("Icon updated")
    } catch (error) {
      console.error("Failed to update icon:", error)
      toast.error("Failed to update icon")
    }
  }

  const handleRename = async (itemId: Id<"menuItems">) => {
    if (!canRename) {
      setRenamingItemId(null)
      return
    }
    if (!renameValue.trim()) {
      setRenamingItemId(null)
      return
    }
    try {
      await updateMenuItem({
        menuItemId: itemId,
        name: renameValue,
      })
      toast.success("Renamed successfully")
      setRenamingItemId(null)
    } catch (error) {
      toast.error("Failed to rename")
    }
  }

  const handleDuplicate = async (itemId: Id<"menuItems">) => {
    if (!canDuplicate) return
    try {
      await duplicateMenuItem(itemId)
      toast.success("Duplicated successfully")
    } catch (error) {
      console.error("Failed to duplicate:", error)
      toast.error("Failed to duplicate")
    }
  }

  const handleDelete = async (itemId: Id<"menuItems">) => {
    if (!canDelete) return
    try {
      await deleteMenuItem(itemId)
      toast.success("Deleted successfully")
    } catch (error) {
      console.error("Failed to delete:", error)
      toast.error("Failed to delete")
    }
  }

  const handleCopyMenuId = (itemId: Id<"menuItems">) => {
    navigator.clipboard.writeText(String(itemId))
    toast.success("Menu ID copied to clipboard")
  }

  const handleUpdateMenu = async (itemId: Id<"menuItems">) => {
    const item = itemLookup.get(String(itemId))
    if (!item) return

    try {
      // Use installFeatureMenus to update the menu
      if (allMutations.installFeatureMenus) {
        await allMutations.installFeatureMenus({
          workspaceId,
          featureSlugs: [item.slug],
          forceUpdate: true,
        })
        toast.success("Menu updated successfully")
      } else {
        toast.error("Update feature not available")
      }
    } catch (error) {
      console.error("Failed to update menu:", error)
      toast.error("Failed to update menu")
    }
  }

  const clearDragState = () => {
    setDraggedItem(null)
    setDropPreview(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: Id<"menuItems">) => {
    if (!allowDragAndDrop) return
    e.preventDefault()
    if (!draggedItem) return

    const targetKey = String(targetId)
    const previewPosition = dropPreview?.id === targetKey ? dropPreview.position : "inside"
    const targetItem = itemLookup.get(targetKey)
    if (!targetItem) {
      clearDragState()
      return
    }

    try {
      let parentId: Id<"menuItems"> | undefined = targetId
      let order = 0

      if (previewPosition === "inside") {
        parentId = targetId
        order = getNextOrder(targetId)
      } else {
        parentId = targetItem.parentId
        const siblings = flatItems
          .filter((item) => String(item.parentId || "") === String(parentId || ""))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const targetIndex = siblings.findIndex((sibling) => String(sibling._id) === targetKey)
        const referenceOrder = targetItem.order ?? 0

        if (previewPosition === "above") {
          const previous = siblings[targetIndex - 1]
          order = previous ? (previous.order + referenceOrder) / 2 : referenceOrder - 1
        } else {
          const nextSibling = siblings[targetIndex + 1]
          order = nextSibling ? (referenceOrder + nextSibling.order) / 2 : referenceOrder + 1
        }
      }

      await updateMenuItem({
        menuItemId: draggedItem,
        parentId: parentId ?? null,
        order,
      })
    } catch (error) {
      console.error("Failed to move item:", error)
    } finally {
      clearDragState()
    }
  }

  const handleDropToRoot = async (e: React.DragEvent) => {
    if (!allowDragAndDrop) return
    e.preventDefault()
    if (!draggedItem) return

    try {
      const order = getNextOrder(undefined)
      await updateMenuItem({
        menuItemId: draggedItem,
        parentId: null,
        order,
      })
    } catch (error) {
      console.error("Failed to move item:", error)
    } finally {
      clearDragState()
    }
  }

  const renderTreeItem = (item: MenuTreeNode, level: number = 0) => {
    const key = String(item._id)
    const isExpanded = expandedItems.has(item._id)
    const hasChildren = Boolean(item.children?.length)
    const isSelected = selectedItemId && String(selectedItemId) === key
    const isPreviewTarget = dropPreview?.id === key
    const previewMode = dropPreview?.position
    const isRenaming = renamingItemId === item._id
    const showSystemIcon = item.metadata?.featureType === "system"

    const showInsideOverlay = isPreviewTarget && previewMode === "inside"
    const showLineAbove = isPreviewTarget && previewMode === "above"
    const showLineBelow = isPreviewTarget && previewMode === "below"

    return (
      <div key={key} className="relative select-none">
        {(showLineAbove || showLineBelow) && (
          <span
            className="pointer-events-none absolute left-0 right-0 h-0.5 rounded-full"
            style={{
              backgroundColor: ACCENT_COLORS.primary,
              top: showLineAbove ? 0 : undefined,
              bottom: showLineBelow ? 0 : undefined,
            }}
          />
        )}
        <div
          className="group relative flex items-center gap-2 py-1.5 pr-2 rounded cursor-pointer transition-colors hover:bg-muted"
          style={{ paddingLeft: `${level * 20}px` }}
          draggable={allowDragAndDrop}
          onDragStart={(event) => {
            if (!allowDragAndDrop) return
            setDraggedItem(item._id)
            setDropPreview(null)
            event.dataTransfer.effectAllowed = 'move'
          }}
          onDragOver={(event) => {
            if (!allowDragAndDrop) return
            event.preventDefault()
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
            const offset = event.clientY - rect.top
            let position: "above" | "below" | "inside" = "inside"
            if (offset < rect.height * DROP_THRESHOLD) {
              position = "above"
            } else if (offset > rect.height * (1 - DROP_THRESHOLD)) {
              position = "below"
            }
            setDropPreview({ id: key, position })
            event.dataTransfer.dropEffect = 'move'
          }}
          onDragLeave={(event) => {
            if (!allowDragAndDrop) return
            const related = event.relatedTarget as Node | null
            if (!(event.currentTarget as HTMLElement).contains(related)) {
              if (dropPreview?.id === key) setDropPreview(null)
            }
          }}
          onDrop={(event) => {
            if (!allowDragAndDrop) return
            handleDrop(event, item._id)
          }}
          onDragEnd={() => {
            if (!allowDragAndDrop) return
            clearDragState()
          }}
          onClick={() => onItemSelect(item._id)}
        >
          {(isSelected || showInsideOverlay) && (
            <span
              className="pointer-events-none absolute inset-0 rounded"
              style={{
                backgroundColor: ACCENT_COLORS.primary,
                border: `1px solid ${ACCENT_COLORS.boundary}`,
                opacity: showInsideOverlay ? 0.18 : 0.1,
              }}
            />
          )}
          {allowDragAndDrop ? (
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          ) : (
            <span className="w-3" />
          )}

          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="z-10 w-4 h-4 p-0"
              onClick={(event) => {
                event.stopPropagation()
                toggleExpanded(item._id)
              }}
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </Button>
          ) : (
            <div className="w-4" />
          )}

          {canChangeAppearance ? (
            <div className="z-10" onClick={(e) => e.stopPropagation()}>
              <IconPicker
                icon={item.icon || "Hash"}
                onIconChange={(newIcon) => handleIconChange(item._id, newIcon)}
                showColor={false}
                showBackground={false}
                trigger={
                  <button className="hover:bg-accent rounded p-0.5 transition-colors">
                    <DynamicIcon name={item.icon || "Hash"} className="w-4 h-4" />
                  </button>
                }
              />
            </div>
          ) : (
            <span className="z-10">
              <DynamicIcon name={item.icon || "Hash"} className="w-4 h-4" />
            </span>
          )}

          {isRenaming && canRename ? (
            <input
              autoFocus
              className="z-10 flex-1 text-sm bg-background border border-border rounded px-1 py-0.5"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => handleRename(item._id)}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === "Enter") {
                  handleRename(item._id)
                } else if (e.key === "Escape") {
                  setRenamingItemId(null)
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="z-10 flex flex-1 items-center gap-2 text-sm">
              <span className="truncate">{item.name}</span>
              {showSystemIcon ? (
                <Shield className="h-4 w-4 text-muted-foreground" aria-label="System menu item" />
              ) : null}
              {updatesMap.has(key) ? (
                <ArrowUpCircle
                  className="h-4 w-4 text-blue-500 animate-pulse"
                  aria-label="Update available"
                />
              ) : null}
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="z-20 ml-auto h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {updatesMap.has(key) && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateMenu(item._id)
                  }}
                  className="text-blue-600 dark:text-blue-400 font-medium"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Update to v{updatesMap.get(key)?.latestVersion}
                </DropdownMenuItem>
              )}
              {canRename ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setRenameValue(item.name)
                    setRenamingItemId(item._id)
                  }}
                >
                  Rename
                </DropdownMenuItem>
              ) : null}
              {canDuplicate ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicate(item._id)
                  }}
                >
                  Duplicate
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyMenuId(item._id)
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Menu ID
              </DropdownMenuItem>
              {canDelete ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item._id)
                  }}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children?.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-2">
      {allowDragAndDrop ? (
        <div
          className="rounded border border-dashed border-muted-foreground/40 p-2 text-xs transition-colors"
          style={
            dropPreview?.id === 'root'
              ? {
                  borderColor: ACCENT_COLORS.boundary,
                  backgroundColor: ACCENT_COLORS.background,
                  opacity: 0.16,
                }
              : undefined
          }
          onDragOver={(event) => {
            if (!allowDragAndDrop) return
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            setDropPreview({ id: 'root', position: 'inside' })
          }}
          onDragLeave={() => {
            if (!allowDragAndDrop) return
            if (dropPreview?.id === 'root') setDropPreview(null)
          }}
          onDrop={handleDropToRoot}
        >
          Drag here to move to the top level
        </div>
      ) : null}
      <div className="space-y-1">
        {tree.map((item) => renderTreeItem(item))}
      </div>
    </div>
  )
}
