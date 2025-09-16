import { useCallback, useMemo, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { GripVertical, ChevronRight, ChevronDown, Folder, FileText, Hash } from "lucide-react"

interface DragDropMenuTreeProps {
  workspaceId: Id<"workspaces">
  onItemSelect: (itemId: Id<"menuItems">) => void
  selectedItemId?: Id<"menuItems">
}

interface MenuItemRecord {
  _id: Id<"menuItems">
  name: string
  type: string
  icon?: string
  parentId?: Id<"menuItems">
  order: number
  children?: MenuItemRecord[]
}

const DROP_THRESHOLD = 0.3

type DropPreview = { id: string; position: "above" | "below" | "inside" } | null

const accentColor = 'var(--accent, rgba(59,130,246,0.68))'
const accentBackground = 'var(--accent, rgba(59,130,246,0.12))'
const accentBoundary = 'var(--accent, rgba(59,130,246,0.45))'

export function DragDropMenuTree({ workspaceId, onItemSelect, selectedItemId }: DragDropMenuTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<Id<"menuItems">>>(new Set())
  const [draggedItem, setDraggedItem] = useState<Id<"menuItems"> | null>(null)
  const [dropPreview, setDropPreview] = useState<DropPreview>(null)

  const menuItems = useQuery(api.menu.menuItems.getWorkspaceMenuItems, { workspaceId }) as
    | MenuItemRecord[]
    | undefined
  const updateMenuItem = useMutation(api.menu.menuItems.updateMenuItem)

  const flatItems = useMemo(() => {
    if (!Array.isArray(menuItems)) return [] as MenuItemRecord[]
    return menuItems.map((item) => ({ ...item })) as MenuItemRecord[]
  }, [menuItems])

  const itemLookup = useMemo(() => {
    const map = new Map<string, MenuItemRecord>()
    flatItems.forEach((item) => map.set(String(item._id), item))
    return map
  }, [flatItems])

  const computeNextOrder = useCallback(
    (parentId?: Id<"menuItems">) => {
      if (!flatItems.length) return 0
      const siblings = flatItems.filter((item) => {
        if (parentId) {
          return String(item.parentId || "") === String(parentId)
        }
        return !item.parentId
      })
      if (siblings.length === 0) return 0
      const orders = siblings.map((item) => (typeof item.order === "number" ? item.order : 0))
      return Math.max(...orders, 0) + 1
    },
    [flatItems],
  )

  const tree = useMemo(() => {
    const itemMap = new Map<string, MenuItemRecord & { children: MenuItemRecord[] }>()
    const roots: (MenuItemRecord & { children: MenuItemRecord[] })[] = []

    flatItems.forEach((item) => {
      itemMap.set(String(item._id), { ...item, children: [] })
    })

    flatItems.forEach((item) => {
      const treeItem = itemMap.get(String(item._id))
      if (!treeItem) return
      if (item.parentId && itemMap.has(String(item.parentId))) {
        itemMap.get(String(item.parentId))!.children.push(treeItem)
      } else {
        roots.push(treeItem)
      }
    })

    const sortRecursive = (items: (MenuItemRecord & { children: MenuItemRecord[] })[]) => {
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      items.forEach((child) => sortRecursive(child.children))
    }

    sortRecursive(roots)
    return roots
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

  const getIcon = (type: string) => {
    switch (type) {
      case "folder":
        return <Folder className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  const clearDragState = () => {
    setDraggedItem(null)
    setDropPreview(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: Id<"menuItems">) => {
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
        order = computeNextOrder(targetId)
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
    e.preventDefault()
    if (!draggedItem) return

    try {
      const order = computeNextOrder(undefined)
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

  const renderTreeItem = (item: MenuItemRecord & { children?: MenuItemRecord[] }, level: number = 0) => {
    const key = String(item._id)
    const isExpanded = expandedItems.has(item._id)
    const hasChildren = Boolean(item.children?.length)
    const isSelected = selectedItemId && String(selectedItemId) === key
    const isPreviewTarget = dropPreview?.id === key
    const previewMode = dropPreview?.position

    const showInsideOverlay = isPreviewTarget && previewMode === "inside"
    const showLineAbove = isPreviewTarget && previewMode === "above"
    const showLineBelow = isPreviewTarget && previewMode === "below"

    return (
      <div key={key} className="relative select-none">
        {(showLineAbove || showLineBelow) && (
          <span
            className="pointer-events-none absolute left-3 right-3 h-0.5 rounded-full"
            style={{
              backgroundColor: accentColor,
              top: showLineAbove ? 0 : undefined,
              bottom: showLineBelow ? 0 : undefined,
            }}
          />
        )}
        <div
          className="relative flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors hover:bg-muted"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          draggable
          onDragStart={(event) => {
            setDraggedItem(item._id)
            setDropPreview(null)
            event.dataTransfer.effectAllowed = 'move'
          }}
          onDragOver={(event) => {
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
            const related = event.relatedTarget as Node | null
            if (!(event.currentTarget as HTMLElement).contains(related)) {
              if (dropPreview?.id === key) setDropPreview(null)
            }
          }}
          onDrop={(event) => handleDrop(event, item._id)}
          onDragEnd={clearDragState}
          onClick={() => onItemSelect(item._id)}
        >
          {(isSelected || showInsideOverlay) && (
            <span
              className="pointer-events-none absolute inset-0 rounded"
              style={{
                backgroundColor: accentColor,
                border: `1px solid ${accentBoundary}`,
                opacity: showInsideOverlay ? 0.18 : 0.1,
              }}
            />
          )}
          <GripVertical className="w-3 h-3 text-muted-foreground" />

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

          {getIcon(item.type)}
          <span className="z-10 text-sm">{item.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children!.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!Array.isArray(menuItems)) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-2">
      <div
        className="rounded border border-dashed border-muted-foreground/40 p-2 text-xs transition-colors"
        style={
          dropPreview?.id === 'root'
            ? {
                borderColor: accentBoundary,
                backgroundColor: accentBackground,
                opacity: 0.16,
              }
            : undefined
        }
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
          setDropPreview({ id: 'root', position: 'inside' })
        }}
        onDragLeave={() => {
          if (dropPreview?.id === 'root') setDropPreview(null)
        }}
        onDrop={handleDropToRoot}
      >
        Drag here to move to the top level
      </div>
      <div className="space-y-1">
        {tree.map((item) => renderTreeItem(item))}
      </div>
    </div>
  )
}
