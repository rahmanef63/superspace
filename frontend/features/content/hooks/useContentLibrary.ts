import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { useState, useCallback, useMemo } from "react"

/**
 * Content Library Types
 * These match the convex/shared/content schema
 */
export type ContentType = "image" | "video" | "audio" | "document" | "link"
export type ContentStatus = "draft" | "processing" | "ready" | "failed" | "archived"
export type AiSource = "nano-banana" | "veo" | "eleven-labs" | "openai-dalle" | "midjourney" | "stable-diffusion" | "other"
export type SortBy = "name" | "createdAt" | "updatedAt" | "fileSize" | "usageCount"
export type SortOrder = "asc" | "desc"

export interface ContentItem {
  _id: Id<"content">
  workspaceId: Id<"workspaces">
  name: string
  description?: string
  type: ContentType
  status: ContentStatus
  storageId?: Id<"_storage">
  url?: string
  thumbnailStorageId?: Id<"_storage">
  mimeType?: string
  fileSize?: number
  dimensions?: {
    width: number
    height: number
  }
  duration?: number
  aiGenerated?: boolean
  aiSource?: AiSource
  aiPrompt?: string
  aiSettings?: Record<string, unknown>
  tags?: string[]
  folder?: string
  createdBy: Id<"users">
  createdAt: number
  updatedAt: number
  usageCount?: number
  // Populated URLs
  fileUrl?: string | null
  thumbnailUrl?: string | null
}

export interface ContentFilters {
  type?: ContentType
  status?: ContentStatus
  folder?: string
  tags?: string[]
  sortBy: SortBy
  sortOrder: SortOrder
  search?: string
}

export interface ContentStats {
  total: number
  byType: Record<ContentType, number>
  byStatus: Record<ContentStatus, number>
  totalSize: number
  aiGenerated: number
}

const DEFAULT_FILTERS: ContentFilters = {
  sortBy: "createdAt",
  sortOrder: "desc",
}

/**
 * Hook for Content Library feature
 * Uses the shared/content API for centralized content management
 */
export function useContentLibrary(workspaceId: Id<"workspaces"> | null | undefined) {
  const [filters, setFilters] = useState<ContentFilters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<Id<"content"> | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  // Fetch content list
  const contentResult = useQuery(
    api.shared.content.queries.list,
    workspaceId ? {
      workspaceId,
      type: filters.type,
      status: filters.status,
      folder: filters.folder,
      tags: filters.tags,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      limit: 100,
    } : "skip"
  )

  // Fetch selected content details
  const selectedContent = useQuery(
    api.shared.content.queries.get,
    workspaceId && selectedId ? {
      workspaceId,
      contentId: selectedId,
    } : "skip"
  )

  // Fetch stats
  const stats = useQuery(
    api.shared.content.queries.getStats,
    workspaceId ? { workspaceId } : "skip"
  )

  // Fetch folders
  const folders = useQuery(
    api.shared.content.queries.getFolders,
    workspaceId ? { workspaceId } : "skip"
  )

  // Fetch tags
  const tags = useQuery(
    api.shared.content.queries.getTags,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations
  const createMutation = useMutation(api.shared.content.mutations.create)
  const updateMutation = useMutation(api.shared.content.mutations.update)
  const deleteMutation = useMutation(api.shared.content.mutations.remove)
  const bulkDeleteMutation = useMutation(api.shared.content.mutations.bulkRemove)
  const createAiJobMutation = useMutation(api.shared.content.mutations.createAiJob)
  const generateUploadUrlMutation = useMutation(api.shared.content.mutations.generateUploadUrl)

  // Filter items by search if needed
  const items = useMemo(() => {
    if (!contentResult?.items) return []
    if (!filters.search) return contentResult.items as ContentItem[]
    
    const searchLower = filters.search.toLowerCase()
    return (contentResult.items as ContentItem[]).filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }, [contentResult?.items, filters.search])

  // Handlers
  const updateFilters = useCallback((newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const selectItem = useCallback((id: Id<"content">) => {
    setSelectedId(id)
  }, [])

  const toggleSelection = useCallback((id: Id<"content">) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectionMode(false)
  }, [])

  const createContent = useCallback(async (data: {
    name: string
    type: ContentType
    description?: string
    url?: string
    folder?: string
    tags?: string[]
  }) => {
    if (!workspaceId) throw new Error("No workspace selected")
    return createMutation({
      workspaceId,
      ...data,
    })
  }, [workspaceId, createMutation])

  const updateContent = useCallback(async (contentId: Id<"content">, data: Partial<{
    name: string
    description: string
    folder: string
    tags: string[]
    status: ContentStatus
  }>) => {
    if (!workspaceId) throw new Error("No workspace selected")
    return updateMutation({
      workspaceId,
      contentId,
      ...data,
    })
  }, [workspaceId, updateMutation])

  const deleteContent = useCallback(async (contentId: Id<"content">) => {
    if (!workspaceId) throw new Error("No workspace selected")
    return deleteMutation({
      workspaceId,
      contentId,
    })
  }, [workspaceId, deleteMutation])

  const bulkDelete = useCallback(async () => {
    if (!workspaceId) throw new Error("No workspace selected")
    const ids = Array.from(selectedIds) as Id<"content">[]
    if (ids.length === 0) return
    await bulkDeleteMutation({
      workspaceId,
      contentIds: ids,
    })
    clearSelection()
  }, [workspaceId, selectedIds, bulkDeleteMutation, clearSelection])

  const createAiJob = useCallback(async (params: {
    type: "image" | "video" | "audio"
    source: AiSource
    prompt: string
    settings?: Record<string, unknown>
  }) => {
    if (!workspaceId) throw new Error("No workspace selected")
    // Note: type is passed in settings for the AI provider to know what to generate
    return createAiJobMutation({
      workspaceId,
      source: params.source,
      prompt: params.prompt,
      settings: { ...params.settings, contentType: params.type },
    })
  }, [workspaceId, createAiJobMutation])

  // Generate upload URL for file storage
  const generateUploadUrl = useCallback(async () => {
    if (!workspaceId) throw new Error("No workspace selected")
    return generateUploadUrlMutation({ workspaceId })
  }, [workspaceId, generateUploadUrlMutation])

  // Upload a file and create content record
  const uploadFile = useCallback(async (params: {
    file: File
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
    storageId: string
  }) => {
    if (!workspaceId) throw new Error("No workspace selected")
    
    // Get file metadata
    const mimeType = params.file.type
    const fileSize = params.file.size
    
    // Get dimensions for images/videos
    let dimensions: { width: number; height: number } | undefined
    if (params.type === "image") {
      dimensions = await getImageDimensions(params.file)
    }

    return createMutation({
      workspaceId,
      name: params.name,
      description: params.description,
      type: params.type,
      storageId: params.storageId as any, // Storage ID from upload
      mimeType,
      fileSize,
      dimensions,
      tags: params.tags,
      folder: params.folder,
    })
  }, [workspaceId, createMutation])

  // Upload URL content
  const uploadUrl = useCallback(async (params: {
    url: string
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
  }) => {
    if (!workspaceId) throw new Error("No workspace selected")
    return createMutation({
      workspaceId,
      name: params.name,
      description: params.description,
      type: params.type,
      url: params.url,
      tags: params.tags,
      folder: params.folder,
    })
  }, [workspaceId, createMutation])

  return {
    // Data
    items,
    selectedContent: selectedContent as ContentItem | null | undefined,
    stats: stats as ContentStats | undefined,
    folders: folders as string[] | undefined,
    availableTags: tags as string[] | undefined,
    totalCount: contentResult?.totalCount ?? 0,
    hasMore: Boolean(contentResult?.nextCursor),
    
    // State
    isLoading: contentResult === undefined,
    filters,
    selectedId,
    selectedIds,
    selectionMode,
    
    // Actions
    updateFilters,
    clearFilters,
    selectItem,
    toggleSelection,
    clearSelection,
    setSelectionMode,
    createContent,
    updateContent,
    deleteContent,
    bulkDelete,
    createAiJob,
    generateUploadUrl,
    uploadFile,
    uploadUrl,
  }
}

// Helper to get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

// Re-export types for components
export type { ContentFilters as ContentFiltersType }
