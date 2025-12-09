import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { useState, useCallback, useMemo } from "react"
import type { ContentType, ContentStatus, AiSource } from "../types"

// Re-export types for convenience
export type { ContentType, ContentStatus, AiSource }

/**
 * Content hook specific types
 */
export type SortBy = "name" | "createdAt" | "updatedAt" | "fileSize" | "usageCount"
export type SortOrder = "asc" | "desc"

export interface ContentFilters {
  type?: ContentType
  status?: ContentStatus
  folder?: string
  tags?: string[]
  sortBy?: SortBy
  sortOrder?: SortOrder
  searchQuery?: string
}

/**
 * Hook for Content feature
 * 
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 * 
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export function useContent(workspaceId: Id<"workspaces"> | null | undefined) {
  // Filter state
  const [filters, setFilters] = useState<ContentFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  
  // Selected content for inspector
  const [selectedContentId, setSelectedContentId] = useState<Id<"content"> | null>(null)

  // ✅ Query content list from shared content backend
  const contentList = useQuery(
    workspaceId ? api.shared.content.queries.list : "skip",
    workspaceId ? {
      workspaceId,
      type: filters.type,
      status: filters.status,
      folder: filters.folder,
      tags: filters.tags,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    } : "skip"
  )

  // ✅ Search content
  const searchResults = useQuery(
    workspaceId && filters.searchQuery ? api.shared.content.queries.search : "skip",
    workspaceId && filters.searchQuery ? {
      workspaceId,
      query: filters.searchQuery,
      type: filters.type,
      status: filters.status,
    } : "skip"
  )

  // ✅ Get selected content details
  const selectedContent = useQuery(
    workspaceId && selectedContentId ? api.shared.content.queries.get : "skip",
    workspaceId && selectedContentId ? {
      workspaceId,
      contentId: selectedContentId,
    } : "skip"
  )

  // ✅ Get content stats
  const stats = useQuery(
    workspaceId ? api.shared.content.queries.getStats : "skip",
    workspaceId ? { workspaceId } : "skip"
  )

  // ✅ Get tags for filtering
  const tags = useQuery(
    workspaceId ? api.shared.content.queries.getTags : "skip",
    workspaceId ? { workspaceId } : "skip"
  )

  // ✅ Get folders for filtering
  const folders = useQuery(
    workspaceId ? api.shared.content.queries.getFolders : "skip",
    workspaceId ? { workspaceId } : "skip"
  )

  // ✅ Get AI jobs
  const aiJobs = useQuery(
    workspaceId ? api.shared.content.queries.getAiJobs : "skip",
    workspaceId ? { workspaceId, limit: 10 } : "skip"
  )

  // ✅ Mutations
  const createContent = useMutation(api.shared.content.mutations.create)
  const bulkCreateContent = useMutation(api.shared.content.mutations.bulkCreate)
  const updateContent = useMutation(api.shared.content.mutations.update)
  const removeContent = useMutation(api.shared.content.mutations.remove)
  const bulkRemoveContent = useMutation(api.shared.content.mutations.bulkRemove)
  const generateUploadUrl = useMutation(api.shared.content.mutations.generateUploadUrl)
  const trackUsage = useMutation(api.shared.content.mutations.trackUsage)
  const createAiJob = useMutation(api.shared.content.mutations.createAiJob)

  // ✅ Filter helpers
  const updateFilters = useCallback((newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: "createdAt",
      sortOrder: "desc",
    })
  }, [])

  // ✅ Determine which data to show (search results or list)
  const displayedContent = useMemo(() => {
    if (filters.searchQuery && searchResults) {
      return { items: searchResults, totalCount: searchResults.length, nextCursor: null }
    }
    return contentList
  }, [filters.searchQuery, searchResults, contentList])

  return {
    // State
    isLoading: displayedContent === undefined && workspaceId !== null && workspaceId !== undefined,
    content: displayedContent,
    selectedContent,
    selectedContentId,
    stats,
    tags,
    folders,
    aiJobs,
    filters,
    
    // Selection
    setSelectedContentId,
    
    // Filters
    updateFilters,
    clearFilters,
    
    // Actions
    createContent,
    bulkCreateContent,
    updateContent,
    removeContent,
    bulkRemoveContent,
    generateUploadUrl,
    trackUsage,
    createAiJob,
  }
}
