"use client"

import React, { useState, useCallback, useRef } from "react"
import { 
  Library, 
  Upload, 
  Sparkles,
  Grid,
  List,
  MessageSquare,
  Info,
  Loader2,
} from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { 
  FeatureThreeColumnLayout 
} from "@/frontend/shared/ui/layout/container/three-column"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useContent } from "../hooks/useContent"
import { ContentList } from "../components/ContentList"
import { ContentInspector } from "../components/ContentInspector"
import { ContentFiltersBar } from "../components/ContentFilters"
import { ContentAIChat } from "../components/ContentAIChat"
import type { ContentItem, ContentType } from "../types"

interface ContentPageProps {
  workspaceId?: Id<"workspaces"> | null
}

type RightPanelMode = "inspector" | "ai-chat"

/**
 * Content Page Component
 * 
 * Three-column layout:
 * - Left: Content list with filters
 * - Center: Content preview/grid
 * - Right: Inspector or AI Chat
 * 
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 */
export default function ContentPage({ workspaceId }: ContentPageProps) {
  const {
    isLoading,
    content,
    selectedContent,
    selectedContentId,
    setSelectedContentId,
    stats,
    tags,
    folders,
    filters,
    updateFilters,
    clearFilters,
    removeContent,
    createAiJob,
    generateUploadUrl,
    createContent,
  } = useContent(workspaceId)

  // Local state
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("inspector")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine content type from mime type
  const getContentType = (mimeType: string): ContentType => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    return "document"
  }

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !workspaceId) return
    
    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        // 1. Generate upload URL
        const uploadUrl = await generateUploadUrl({ workspaceId })
        
        // 2. Upload file to storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        const { storageId } = await response.json()
        
        // 3. Create content record
        await createContent({
          workspaceId,
          name: file.name,
          type: getContentType(file.type),
          storageId,
          mimeType: file.type,
          fileSize: file.size,
        })
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [workspaceId, generateUploadUrl, createContent])

  // Handle AI generation
  const handleAIGenerate = useCallback(async (params: {
    source: any
    prompt: string
    type: "image" | "video" | "audio"
  }) => {
    if (!workspaceId) return
    await createAiJob({
      workspaceId,
      source: params.source,
      prompt: params.prompt,
    })
  }, [workspaceId, createAiJob])

  // Handle delete
  const handleDelete = useCallback(async (contentId: Id<"content">) => {
    if (!workspaceId) return
    await removeContent({ workspaceId, contentId })
    if (selectedContentId === contentId) {
      setSelectedContentId(null)
    }
  }, [workspaceId, removeContent, selectedContentId, setSelectedContentId])

  // Handle no workspace
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Content
          </p>
        </div>
      </PageContainer>
    )
  }

  // Stats text
  const statsText = stats 
    ? `${content?.totalCount ?? 0} of ${stats.total} items`
    : undefined

  // Sidebar content (left panel)
  const sidebarContent = (
    <ContentList
      items={content?.items ?? []}
      selectedId={selectedContentId}
      onSelect={setSelectedContentId}
      onDelete={handleDelete}
    />
  )

  // Sidebar actions
  const sidebarActions = (
    <div className="flex items-center gap-1">
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
        onClick={() => setViewMode("list")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
        onClick={() => setViewMode("grid")}
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  )

  // Main header content
  const mainHeader = (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Library className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold">Content Library</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your workspace assets
          </p>
        </div>
        <Badge variant="secondary">Beta</Badge>
      </div>
      <div className="flex items-center gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
        <Button size="sm" onClick={() => setRightPanelMode("ai-chat")}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </div>
    </div>
  )

  // Main content (center panel)
  const mainContent = (
    <div className="h-full flex flex-col">
      {/* Filters bar - handles all filtering including type */}
      <div className="flex-shrink-0 px-4 py-2 border-b">
        <ContentFiltersBar
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
          availableTags={tags ?? []}
          availableFolders={folders ?? []}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading content...</div>
          </div>
        ) : !content?.items?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Library className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Upload assets or generate new content using AI tools. 
              All your images, videos, audio, and documents will appear here.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
              <Button variant="outline" onClick={() => setRightPanelMode("ai-chat")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.items.map((item: ContentItem) => (
              <div
                key={item._id}
                className={`
                  aspect-square rounded-lg border bg-muted/30 overflow-hidden cursor-pointer
                  transition-all hover:ring-2 hover:ring-primary/50
                  ${selectedContentId === item._id ? "ring-2 ring-primary" : ""}
                `}
                onClick={() => setSelectedContentId(item._id)}
              >
                {item.thumbnailUrl || item.fileUrl ? (
                  <img
                    src={item.thumbnailUrl || item.fileUrl || ""}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Library className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ContentList
            items={content.items}
            selectedId={selectedContentId}
            onSelect={setSelectedContentId}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )

  // Right panel content (inspector or AI chat)
  const rightPanel = (
    <div className="h-full flex flex-col">
      {/* Panel mode toggle */}
      <div className="flex-shrink-0 border-b p-2">
        <div className="flex gap-1">
          <Button
            variant={rightPanelMode === "inspector" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setRightPanelMode("inspector")}
          >
            <Info className="h-4 w-4 mr-1" />
            Inspector
          </Button>
          <Button
            variant={rightPanelMode === "ai-chat" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setRightPanelMode("ai-chat")}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            AI Chat
          </Button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {rightPanelMode === "inspector" ? (
          <ContentInspector
            content={selectedContent ?? null}
            onDelete={() => selectedContentId && handleDelete(selectedContentId)}
          />
        ) : (
          <ContentAIChat
            onGenerate={handleAIGenerate}
          />
        )}
      </div>
    </div>
  )

  return (
    <FeatureThreeColumnLayout
      sidebarTitle="Content"
      sidebarStats={statsText}
      sidebarActions={sidebarActions}
      sidebarContent={sidebarContent}
      searchProps={{
        value: filters.searchQuery ?? "",
        onChange: (value) => updateFilters({ searchQuery: value || undefined }),
        placeholder: "Search content...",
      }}
      mainHeader={mainHeader}
      mainContent={mainContent}
      inspector={rightPanel}
    />
  )
}
