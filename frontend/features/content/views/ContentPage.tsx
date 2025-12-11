"use client"

import React, { useState, useMemo, useCallback } from "react"
import {
  Library,
  Upload,
  Sparkles,
  Grid,
  List,
  Trash2,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  Info,
  Bot,
  ChevronLeft,
  Edit,
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { useContentLibrary, type ContentType } from "../hooks/useContentLibrary"
import { ContentList } from "../components/ContentList"
import { ContentInspector } from "../components/ContentInspector"
import { ContentAIChat } from "../components/ContentAIChat"
import { FolderManager } from "../components/FolderManager"
import { UploadDialog } from "@/frontend/shared/ui/components/upload"
import { ImageEditorDialog } from "@/frontend/shared/ui/components/upload"

interface ContentPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const typeFilters: { value: ContentType | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All", icon: Library },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "document", label: "Docs", icon: FileText },
  { value: "link", label: "Links", icon: LinkIcon },
]

/**
 * Content Library Page
 * 
 * Centralized content management for images, videos, audio, and documents
 * with AI generation capabilities.
 */
export default function ContentPage({ workspaceId }: ContentPageProps) {
  const isMobile = useIsMobile()

  // View state
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchValue, setSearchValue] = useState("")
  const [activeTypeFilter, setActiveTypeFilter] = useState<ContentType | "all">("all")
  const [rightPanelMode, setRightPanelMode] = useState<"inspector" | "ai">("inspector")
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [editingImageSrc, setEditingImageSrc] = useState<string | null>(null)

  const {
    items,
    selectedContent,
    stats,
    folders,
    availableTags,
    isLoading,
    filters,
    selectedId,
    selectedIds,
    selectionMode,
    updateFilters,
    clearFilters,
    selectItem,
    toggleSelection,
    clearSelection,
    setSelectionMode,
    createContent,
    deleteContent,
    bulkDelete,
    createAiJob,
    generateUploadUrl,
    uploadFile,
    uploadUrl,
    updateContent,
  } = useContentLibrary(workspaceId)

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    updateFilters({ search: value })
  }, [updateFilters])

  // Handle type filter
  const handleTypeFilter = useCallback((type: ContentType | "all") => {
    setActiveTypeFilter(type)
    updateFilters({ type: type === "all" ? undefined : type })
  }, [updateFilters])

  // Handle item select
  const handleSelectItem = useCallback((id: Id<"content">) => {
    selectItem(id)
    setRightPanelMode("inspector")
    setRightPanelCollapsed(false)
  }, [selectItem])

  // Handle delete
  const handleDelete = useCallback(async (id: Id<"content">) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await deleteContent(id)
    }
  }, [deleteContent])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
      await bulkDelete()
    }
  }, [selectedIds.size, bulkDelete])

  // Handle AI generate
  const handleAIGenerate = useCallback(async (params: {
    source: string
    prompt: string
    type: "image" | "video" | "audio"
  }) => {
    try {
      await createAiJob({
        type: params.type,
        source: params.source as any,
        prompt: params.prompt,
      })
    } catch (error) {
      console.error("Failed to create AI job:", error)
    }
  }, [createAiJob])

  // Handle file upload - files are already uploaded to storage, just create content records
  const handleUpload = useCallback(async (files: {
    file: File
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
    storageId: string // Already uploaded, storage ID provided
  }[]) => {
    for (const fileData of files) {
      try {
        // Create content record with the storage ID from UploadDialog
        await uploadFile({
          file: fileData.file,
          name: fileData.name,
          description: fileData.description,
          type: fileData.type,
          tags: fileData.tags,
          folder: fileData.folder,
          storageId: fileData.storageId,
        })
      } catch (error) {
        console.error("Failed to create content record:", error)
      }
    }
  }, [uploadFile])

  // Handle URL upload
  const handleUploadUrl = useCallback(async (data: {
    url: string
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
  }) => {
    try {
      await uploadUrl(data)
    } catch (error) {
      console.error("Failed to add URL:", error)
    }
  }, [uploadUrl])

  // Handle image edit
  const handleEditImage = useCallback(() => {
    if (selectedContent?.type === "image" && selectedContent.fileUrl) {
      setEditingImageSrc(selectedContent.fileUrl)
      setImageEditorOpen(true)
    }
  }, [selectedContent])

  // Handle save edited image
  const handleSaveEditedImage = useCallback(async (blob: Blob) => {
    if (!selectedContent) return

    try {
      // Upload edited image
      const uploadUrlStr = await generateUploadUrl()
      const response = await fetch(uploadUrlStr, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { storageId } = await response.json()

      // Update content with new storage ID
      await updateContent(selectedContent._id, {
        // The update will replace the storageId
      })

      console.log("Image saved with new storageId:", storageId)
    } catch (error) {
      console.error("Failed to save edited image:", error)
    }
  }, [selectedContent, generateUploadUrl, updateContent])

  // No workspace
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Content Library
          </p>
        </div>
      </PageContainer>
    )
  }

  // Stats display
  const statsDisplay = stats
    ? `${stats.total} items`
    : "Loading..."

  // ============================================================================
  // Filter Tabs (used in sidebar header)
  // ============================================================================
  const filterTabs = (
    <Tabs value={activeTypeFilter} onValueChange={(v) => handleTypeFilter(v as ContentType | "all")}>
      <TabsList className="h-8 p-0.5 w-full justify-start flex-wrap bg-transparent">
        {typeFilters.map((filter) => (
          <TabsTrigger
            key={filter.value}
            value={filter.value}
            className="h-7 px-2 text-xs data-[state=active]:bg-background"
          >
            <filter.icon className="h-3 w-3 mr-1" />
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )

  // ============================================================================
  // Sidebar Header Actions
  // ============================================================================
  const sidebarHeaderActions = (
    <div className="flex items-center gap-1">
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setViewMode("list")}
        title="List view"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setViewMode("grid")}
        title="Grid view"
      >
        <Grid className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  // ============================================================================
  // Sidebar Actions (selection mode)
  // ============================================================================
  const sidebarSelectionBar = selectionMode ? (
    <div className="flex items-center gap-1 w-full justify-between bg-muted/50 p-2 rounded-md">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="h-7 text-xs px-2"
        >
          Cancel
        </Button>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {selectedIds.size} selected
        </span>
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="h-7 w-7"
        disabled={selectedIds.size === 0}
        onClick={handleBulkDelete}
        title="Delete Selected"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  ) : null

  // ============================================================================
  // Sidebar Content
  // ============================================================================
  const sidebarContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Library className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-sm mb-1">No content yet</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Upload files or generate with AI
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setRightPanelMode("ai")
                setRightPanelCollapsed(false)
              }}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Generate
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {/* Folder Manager */}
        <FolderManager
          folders={folders ?? []}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
        />

        {sidebarSelectionBar}
        {!selectionMode && (
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {statsDisplay}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setSelectionMode(true)}
            >
              Select
            </Button>
          </div>
        )}
        <ContentList
          items={selectedFolder ? items.filter(item => item.folder === selectedFolder) : items}
          selectedId={selectedId}
          onSelect={handleSelectItem}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onDelete={handleDelete}
        />
      </div>
    )
  }, [isLoading, items, sidebarSelectionBar, selectionMode, statsDisplay, selectedId, handleSelectItem, selectedIds, toggleSelection, handleDelete, setSelectionMode, folders, selectedFolder])

  // ============================================================================
  // Main Content (Preview)
  // ============================================================================
  const mainContent = useMemo(() => {
    if (!selectedContent) {
      return (
        <div className="h-full flex items-center justify-center text-center p-6">
          <div>
            <Library className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-muted-foreground">Select content to preview</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Choose an item from the list to see details
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex items-center justify-center p-6 bg-muted/30">
        {selectedContent.type === "image" && selectedContent.fileUrl ? (
          <div className="relative group">
            <img
              src={selectedContent.fileUrl}
              alt={selectedContent.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleEditImage}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        ) : selectedContent.type === "video" && selectedContent.fileUrl ? (
          <video
            src={selectedContent.fileUrl}
            controls
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        ) : selectedContent.type === "audio" && selectedContent.fileUrl ? (
          <div className="text-center">
            <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
              <Music className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">{selectedContent.name}</h3>
            <audio src={selectedContent.fileUrl} controls className="w-full max-w-md" />
          </div>
        ) : (
          <div className="text-center">
            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center mb-4 mx-auto">
              {selectedContent.type === "document" ? (
                <FileText className="h-12 w-12 text-muted-foreground" />
              ) : (
                <LinkIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-medium mb-1">{selectedContent.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedContent.description}</p>
            {selectedContent.fileUrl && (
              <Button className="mt-4" asChild>
                <a href={selectedContent.fileUrl} target="_blank" rel="noopener noreferrer">
                  Open File
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }, [selectedContent, handleEditImage])

  // Main header (shows selected item name and panel toggles)
  const mainHeader = selectedContent ? (
    <div className="flex items-center justify-between px-4 py-2 h-12 bg-muted/10">
      <span className="font-medium text-sm truncate">{selectedContent.name}</span>
      <div className="flex items-center gap-1">
        <Button
          variant={rightPanelMode === "inspector" && !rightPanelCollapsed ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            setRightPanelMode("inspector")
            setRightPanelCollapsed(false)
          }}
        >
          <Info className="h-3.5 w-3.5 mr-1" />
          Info
        </Button>
        <Button
          variant={rightPanelMode === "ai" && !rightPanelCollapsed ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            setRightPanelMode("ai")
            setRightPanelCollapsed(false)
          }}
        >
          <Bot className="h-3.5 w-3.5 mr-1" />
          AI
        </Button>
      </div>
    </div>
  ) : null

  // ============================================================================
  // Right Panel (Inspector or AI Chat)
  // ============================================================================
  const rightPanel = useMemo(() => {
    if (rightPanelMode === "ai") {
      return (
        <ContentAIChat
          onGenerate={handleAIGenerate}
          isGenerating={false}
        />
      )
    }

    if (selectedContent) {
      return (
        <ContentInspector
          content={selectedContent}
          onEdit={handleEditImage}
          onDelete={() => handleDelete(selectedContent._id)}
          onDownload={() => {
            if (selectedContent.fileUrl) {
              window.open(selectedContent.fileUrl, "_blank")
            }
          }}
          onUpdate={async (id, updates) => {
            await updateContent(id, updates)
          }}
        />
      )
    }

    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select content to view details</p>
        </div>
      </div>
    )
  }, [rightPanelMode, selectedContent, handleDelete, handleAIGenerate, handleEditImage, updateContent])

  // ============================================================================
  // Mobile View
  // ============================================================================
  if (isMobile) {
    // Mobile: Show AI Chat full screen
    if (rightPanelMode === "ai" && !rightPanelCollapsed) {
      return (
        <div className="flex flex-col h-full bg-background">
          <div className="flex items-center border-b p-2 gap-2 h-14 bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelCollapsed(true)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">AI Content Generator</h3>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ContentAIChat
              onGenerate={handleAIGenerate}
              isGenerating={false}
            />
          </div>
        </div>
      )
    }

    // Mobile: Show selected content detail
    if (selectedContent) {
      return (
        <div className="flex flex-col h-full bg-background">
          <div className="flex items-center border-b p-2 gap-2 h-14 bg-background">
            <Button variant="ghost" size="icon" onClick={() => selectItem(null as any)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-sm">{selectedContent.name}</h3>
              <p className="text-xs text-muted-foreground truncate capitalize">{selectedContent.type}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setRightPanelMode("ai")
                setRightPanelCollapsed(false)
              }}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {mainContent}
          </div>
        </div>
      )
    }

    // Mobile: Show list with header
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Mobile Header */}
        <FeatureHeader
          title="Content Library"
          icon={Library}
          primaryAction={{
            label: "Upload",
            icon: Upload,
            onClick: () => setUploadDialogOpen(true),
          }}
          secondaryActions={[
            <Button
              key="generate"
              variant="outline"
              size="sm"
              onClick={() => {
                setRightPanelMode("ai")
                setRightPanelCollapsed(false)
              }}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Generate
            </Button>
          ]}
          toolbar={filterTabs}
        />
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarContent}
        </div>

        {/* Dialogs */}
        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUpload={handleUpload}
          onUploadUrl={handleUploadUrl}
          generateUploadUrl={generateUploadUrl}
          folders={folders ?? []}
          availableTags={availableTags ?? []}
        />
      </div>
    )
  }

  // ============================================================================
  // Desktop View
  // ============================================================================
  return (
    <div className="flex flex-col h-full">
      {/* Feature Header - Main page header */}
      <FeatureHeader
        title="Content Library"
        icon={Library}
        meta={[{ label: "Items", value: stats?.total ?? 0 }]}
        primaryAction={{
          label: "Upload",
          icon: Upload,
          onClick: () => setUploadDialogOpen(true),
        }}
        secondaryActions={[
          <Button
            key="generate"
            variant={rightPanelMode === "ai" && !rightPanelCollapsed ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setRightPanelMode("ai")
              setRightPanelCollapsed(false)
            }}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate
          </Button>
        ]}
      />

      {/* Three Column Layout */}
      <div className="flex-1 min-h-0">
        <FeatureThreeColumnLayout
          // Sidebar config
          sidebarTitle=""
          sidebarStats=""
          sidebarActions={sidebarHeaderActions}
          sidebarContent={sidebarContent}

          // Filter tabs in sidebar header
          filterOptions={filterTabs}

          // Center
          mainContent={mainContent}
          mainHeader={mainHeader}

          // Right
          inspector={rightPanel}

          // Layout Props
          storageKey="content-library-layout"
          rightCollapsed={rightPanelCollapsed}
          onRightCollapsedChange={setRightPanelCollapsed}
        />
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
        onUploadUrl={handleUploadUrl}
        generateUploadUrl={generateUploadUrl}
        folders={folders ?? []}
        availableTags={availableTags ?? []}
      />

      {/* Image Editor Dialog */}
      {editingImageSrc && (
        <ImageEditorDialog
          open={imageEditorOpen}
          onOpenChange={setImageEditorOpen}
          imageSrc={editingImageSrc}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  )
}
