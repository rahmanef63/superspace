import { useCallback, useMemo, useState } from "react"
import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Hash,
  MoreVertical,
  Copy,
  Home,
  Settings,
  Users,
  Mail,
  Calendar,
  BarChart,
  Package,
  ShoppingCart,
  MessageSquare,
  Bell,
  Search,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  Camera,
  Clock,
  Code,
  Database,
  Download,
  Edit,
  Eye,
  Film,
  Gift,
  Globe,
  Image,
  Key,
  Layers,
  Lock,
  Map as MapIcon,
  Music,
  Phone,
  Play,
  Printer,
  Radio,
  Save,
  Send,
  Share2,
  Shield,
  Smile,
  Tag,
  Target,
  Trash,
  TrendingUp,
  Tv,
  Upload,
  User,
  Video,
  Wifi,
  Zap
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

  const AVAILABLE_ICONS = [
    { name: "Folder", icon: Folder },
    { name: "FileText", icon: FileText },
    { name: "Hash", icon: Hash },
    { name: "Home", icon: Home },
    { name: "Settings", icon: Settings },
    { name: "Users", icon: Users },
    { name: "Mail", icon: Mail },
    { name: "Calendar", icon: Calendar },
    { name: "BarChart", icon: BarChart },
    { name: "Package", icon: Package },
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "MessageSquare", icon: MessageSquare },
    { name: "Bell", icon: Bell },
    { name: "Search", icon: Search },
    { name: "Star", icon: Star },
    { name: "Heart", icon: Heart },
    { name: "BookOpen", icon: BookOpen },
    { name: "Briefcase", icon: Briefcase },
    { name: "Camera", icon: Camera },
    { name: "Clock", icon: Clock },
    { name: "Code", icon: Code },
    { name: "Database", icon: Database },
    { name: "Download", icon: Download },
    { name: "Edit", icon: Edit },
    { name: "Eye", icon: Eye },
    { name: "Film", icon: Film },
    { name: "Gift", icon: Gift },
    { name: "Globe", icon: Globe },
    { name: "Image", icon: Image },
    { name: "Key", icon: Key },
    { name: "Layers", icon: Layers },
    { name: "Lock", icon: Lock },
    { name: "Map", icon: MapIcon },
    { name: "Music", icon: Music },
    { name: "Phone", icon: Phone },
    { name: "Play", icon: Play },
    { name: "Printer", icon: Printer },
    { name: "Radio", icon: Radio },
    { name: "Save", icon: Save },
    { name: "Send", icon: Send },
    { name: "Share2", icon: Share2 },
    { name: "Shield", icon: Shield },
    { name: "Smile", icon: Smile },
    { name: "Tag", icon: Tag },
    { name: "Target", icon: Target },
    { name: "Trash", icon: Trash },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "Tv", icon: Tv },
    { name: "Upload", icon: Upload },
    { name: "User", icon: User },
    { name: "Video", icon: Video },
    { name: "Wifi", icon: Wifi },
    { name: "Zap", icon: Zap },
  ]

  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    Folder,
    FileText,
    Hash,
    Home,
    Settings,
    Users,
    Mail,
    Calendar,
    BarChart,
    Package,
    ShoppingCart,
    MessageSquare,
    Bell,
    Search,
    Star,
    Heart,
    BookOpen,
    Briefcase,
    Camera,
    Clock,
    Code,
    Database,
    Download,
    Edit,
    Eye,
    Film,
    Gift,
    Globe,
    Image,
    Key,
    Layers,
    Lock,
    Map: MapIcon,
    Music,
    Phone,
    Play,
    Printer,
    Radio,
    Save,
    Send,
    Share2,
    Shield,
    Smile,
    Tag,
    Target,
    Trash,
    TrendingUp,
    Tv,
    Upload,
    User,
    Video,
    Wifi,
    Zap,
  }

  const getIcon = (iconName?: string, fallbackType?: string) => {
    // Try to match icon name (case-insensitive)
    const searchKey = (iconName || fallbackType || 'hash')
    const IconComponent = iconMap[searchKey] ||
                         Object.entries(iconMap).find(([key]) =>
                           key.toLowerCase() === searchKey.toLowerCase()
                         )?.[1] ||
                         Hash
    return <IconComponent className="w-4 h-4" />
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

    const showInsideOverlay = isPreviewTarget && previewMode === "inside"
    const showLineAbove = isPreviewTarget && previewMode === "above"
    const showLineBelow = isPreviewTarget && previewMode === "below"

    return (
      <div key={key} className="relative select-none">
        {(showLineAbove || showLineBelow) && (
          <span
            className="pointer-events-none absolute left-3 right-3 h-0.5 rounded-full"
            style={{
              backgroundColor: ACCENT_COLORS.primary,
              top: showLineAbove ? 0 : undefined,
              bottom: showLineBelow ? 0 : undefined,
            }}
          />
        )}
        <div
          className="group relative flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-muted"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
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
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="z-10 hover:bg-accent rounded p-0.5 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getIcon(item.icon, item.type)}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="text-xs font-medium mb-2">Choose Icon</div>
                <div className="grid grid-cols-6 gap-1">
                  {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      className="p-2 hover:bg-accent rounded transition-colors flex items-center justify-center"
                      onClick={() => {
                        handleIconChange(item._id, name)
                      }}
                      title={name}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <span className="z-10">{getIcon(item.icon, item.type)}</span>
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
            <span className="z-10 text-sm flex-1">{item.name}</span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="z-20 ml-auto h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
