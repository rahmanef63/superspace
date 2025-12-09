"use client"

import React from "react"
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  MoreHorizontal,
  Sparkles,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Id } from "@convex/_generated/dataModel"
import type { ContentItem, ContentType } from "../types"

interface ContentListProps {
  items: ContentItem[]
  selectedId: Id<"content"> | null
  onSelect: (id: Id<"content">) => void
  selectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelection?: (id: Id<"content">) => void
  onDelete?: (id: Id<"content">) => void
  onDuplicate?: (id: Id<"content">) => void
}

const typeIcons: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  link: LinkIcon,
}

const typeColors: Record<ContentType, string> = {
  image: "bg-pink-500/10 text-pink-500",
  video: "bg-purple-500/10 text-purple-500",
  audio: "bg-orange-500/10 text-orange-500",
  document: "bg-blue-500/10 text-blue-500",
  link: "bg-green-500/10 text-green-500",
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ""
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function ContentList({
  items,
  selectedId,
  onSelect,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  onDelete,
  onDuplicate,
}: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No content found</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = typeIcons[item.type]
        const isSelected = selectedId === item._id
        const isChecked = selectedIds.has(item._id)

        return (
          <div
            key={item._id}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors",
              isSelected
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted/50"
            )}
            onClick={() => !selectionMode && onSelect(item._id)}
          >
            {/* Selection checkbox */}
            {selectionMode && (
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggleSelection?.(item._id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Thumbnail or Icon */}
            <div
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center overflow-hidden",
                item.thumbnailUrl || item.fileUrl
                  ? "bg-muted"
                  : typeColors[item.type]
              )}
            >
              {(item.thumbnailUrl || (item.type === "image" && item.fileUrl)) ? (
                <img
                  src={item.thumbnailUrl || item.fileUrl || ""}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.aiGenerated && (
                  <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{item.type}</span>
                {item.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(item.fileSize)}</span>
                  </>
                )}
                <span>•</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            {!selectionMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDuplicate?.(item._id)}>
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete?.(item._id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      })}
    </div>
  )
}
