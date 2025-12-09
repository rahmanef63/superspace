"use client"

import React from "react"
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Calendar,
  User,
  Tag,
  Folder,
  ExternalLink,
  Download,
  Copy,
  Trash2,
  Edit,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Id } from "@convex/_generated/dataModel"
import type { ContentType } from "../hooks/useContent"

interface ContentInspectorProps {
  content: {
    _id: Id<"content">
    name: string
    description?: string
    type: ContentType
    status: string
    mimeType?: string
    fileSize?: number
    dimensions?: { width: number; height: number }
    duration?: number
    thumbnailUrl?: string | null
    fileUrl?: string | null
    url?: string
    aiGenerated?: boolean
    aiSource?: string
    aiPrompt?: string
    tags?: string[]
    folder?: string
    createdAt: number
    updatedAt: number
    usageCount?: number
  } | null
  onEdit?: () => void
  onDelete?: () => void
  onDownload?: () => void
}

const typeIcons: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  link: LinkIcon,
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  ready: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-600",
  archived: "bg-gray-500/10 text-gray-600",
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown"
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "Unknown"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ContentInspector({
  content,
  onEdit,
  onDelete,
  onDownload,
}: ContentInspectorProps) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">No content selected</h3>
        <p className="text-sm text-muted-foreground">
          Select an item from the list to view its details
        </p>
      </div>
    )
  }

  const Icon = typeIcons[content.type]

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Preview */}
        <div className="aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center">
          {content.type === "image" && (content.fileUrl || content.thumbnailUrl) ? (
            <img
              src={content.fileUrl || content.thumbnailUrl || ""}
              alt={content.name}
              className="w-full h-full object-contain"
            />
          ) : content.type === "video" && content.fileUrl ? (
            <video
              src={content.fileUrl}
              controls
              className="w-full h-full"
              poster={content.thumbnailUrl || undefined}
            />
          ) : content.type === "audio" && content.fileUrl ? (
            <div className="flex flex-col items-center gap-4 p-4">
              <Music className="h-16 w-16 text-muted-foreground" />
              <audio src={content.fileUrl} controls className="w-full" />
            </div>
          ) : (
            <Icon className="h-16 w-16 text-muted-foreground" />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {content.fileUrl && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Details</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">Name</span>
              <span className="font-medium">{content.name}</span>
            </div>

            {content.description && (
              <div className="flex items-start gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Description</span>
                <span>{content.description}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">Type</span>
              <Badge variant="secondary" className="capitalize">
                <Icon className="h-3 w-3 mr-1" />
                {content.type}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">Status</span>
              <Badge className={cn("capitalize", statusColors[content.status])}>
                {content.status}
              </Badge>
            </div>

            {content.mimeType && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">MIME Type</span>
                <span className="font-mono text-xs">{content.mimeType}</span>
              </div>
            )}

            {content.fileSize && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Size</span>
                <span>{formatFileSize(content.fileSize)}</span>
              </div>
            )}

            {content.dimensions && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Dimensions</span>
                <span>{content.dimensions.width} × {content.dimensions.height}</span>
              </div>
            )}

            {content.duration && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">Duration</span>
                <span>{formatDuration(content.duration)}</span>
              </div>
            )}

            {content.url && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 flex-shrink-0">URL</span>
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 truncate"
                >
                  {content.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* AI Generation Info */}
        {content.aiGenerated && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Generated
              </h4>
              
              <div className="space-y-2 text-sm">
                {content.aiSource && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-20 flex-shrink-0">Source</span>
                    <Badge variant="outline" className="capitalize">
                      {content.aiSource.replace("-", " ")}
                    </Badge>
                  </div>
                )}

                {content.aiPrompt && (
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground w-20 flex-shrink-0">Prompt</span>
                    <span className="text-xs bg-muted p-2 rounded-md">{content.aiPrompt}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Organization */}
        {(content.tags?.length || content.folder) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Organization</h4>
              
              <div className="space-y-2 text-sm">
                {content.folder && (
                  <div className="flex items-center gap-3">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span>{content.folder}</span>
                  </div>
                )}

                {content.tags && content.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {content.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Metadata */}
        <Separator />
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Metadata</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(content.createdAt)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDate(content.updatedAt)}</span>
            </div>

            {content.usageCount !== undefined && (
              <div className="flex items-center gap-3">
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Used in</span>
                <span>{content.usageCount} places</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
