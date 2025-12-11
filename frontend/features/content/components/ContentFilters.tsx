"use client"

import React from "react"
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  X,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { ContentType, ContentStatus, SortBy, SortOrder, ContentFiltersType as ContentFilters } from "../hooks/useContentLibrary"

interface ContentFiltersProps {
  filters: ContentFilters
  onUpdateFilters: (filters: Partial<ContentFilters>) => void
  onClearFilters: () => void
  availableTags?: string[]
  availableFolders?: string[]
}

const contentTypes: { value: ContentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "document", label: "Documents", icon: FileText },
  { value: "link", label: "Links", icon: LinkIcon },
]

const contentStatuses: { value: ContentStatus; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "draft", label: "Draft" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "archived", label: "Archived" },
]

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Date Modified" },
  { value: "name", label: "Name" },
  { value: "fileSize", label: "File Size" },
  { value: "usageCount", label: "Usage Count" },
]

export function ContentFiltersBar({
  filters,
  onUpdateFilters,
  onClearFilters,
  availableTags = [],
  availableFolders = [],
}: ContentFiltersProps) {
  const activeFilterCount = [
    filters.type,
    filters.status,
    filters.folder,
    filters.tags?.length,
  ].filter(Boolean).length

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Type Filter */}
      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          onUpdateFilters({ type: value === "all" ? undefined : (value as ContentType) })
        }
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {contentTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex items-center gap-2">
                <type.icon className="h-3 w-3" />
                {type.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onUpdateFilters({ status: value === "all" ? undefined : (value as ContentStatus) })
        }
      >
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {contentStatuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Folder Filter */}
      {availableFolders.length > 0 && (
        <Select
          value={filters.folder || "all"}
          onValueChange={(value) =>
            onUpdateFilters({ folder: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {availableFolders.map((folder) => (
              <SelectItem key={folder} value={folder}>
                {folder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Advanced Filters */}
      {availableTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Filter className="h-3 w-3" />
              Tags
              {filters.tags?.length ? (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {filters.tags.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Filter by Tags</Label>
              <div className="space-y-2 max-h-[200px] overflow-auto">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags?.includes(tag)}
                      onCheckedChange={(checked) => {
                        const currentTags = filters.tags || []
                        if (checked) {
                          onUpdateFilters({ tags: [...currentTags, tag] })
                        } else {
                          onUpdateFilters({
                            tags: currentTags.filter((t) => t !== tag),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-xs">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Separator orientation="vertical" className="h-6" />

      {/* Sort */}
      <Select
        value={filters.sortBy || "createdAt"}
        onValueChange={(value) => onUpdateFilters({ sortBy: value as SortBy })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortOrder || "desc"}
        onValueChange={(value) => onUpdateFilters({ sortOrder: value as SortOrder })}
      >
        <SelectTrigger className="w-[100px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest</SelectItem>
          <SelectItem value="asc">Oldest</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1 text-muted-foreground"
          onClick={onClearFilters}
        >
          <X className="h-3 w-3" />
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  )
}
