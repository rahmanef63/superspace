import { useCallback, useMemo, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type {
  CreateWikiPageInput,
  UpdateWikiPageInput,
  WikiCategory,
  WikiPageRecord,
  WikiStats,
} from "../types"

const CATEGORY_KEYS: WikiCategory[] = ["general", "product", "engineering", "operations", "sales", "support"]

export interface UseWikiOptions {
  category?: WikiCategory | "all"
  search?: string
  publishedOnly?: boolean
}

/**
 * Wiki Hook
 *
 * Provides data and actions for the wiki feature.
 */
export function useWiki(workspaceId?: Id<"workspaces"> | null, options: UseWikiOptions = {}) {
  const [error, setError] = useState<Error | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const categoryFilter =
    options.category && options.category !== "all" ? options.category : undefined

  const pagesQuery = useQuery(
    api.features.wiki.queries.list as any,
    workspaceId
      ? {
          workspaceId,
          category: categoryFilter,
          search: options.search,
          publishedOnly: options.publishedOnly,
        }
      : "skip",
  )

  const createPageMutation = useMutation(api.features.wiki.mutations.create as any)
  const updatePageMutation = useMutation(api.features.wiki.mutations.update as any)
  const deletePageMutation = useMutation(api.features.wiki.mutations.remove as any)

  const isLoading = workspaceId ? pagesQuery === undefined : false

  const pages = useMemo<WikiPageRecord[]>(() => {
    if (!pagesQuery) return []
    return (pagesQuery as any[]).map((page) => ({
      id: page._id,
      workspaceId: page.workspaceId,
      title: page.title,
      content: page.content,
      summary: page.summary ?? null,
      category: (page.category ?? null) as WikiCategory | null,
      slug: page.slug ?? null,
      isPublished: page.isPublished ?? true,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      createdBy: page.createdBy ?? null,
      updatedBy: page.updatedBy ?? null,
    }))
  }, [pagesQuery])

  const stats = useMemo<WikiStats>(() => {
    const summary: WikiStats = {
      total: pages.length,
      published: pages.filter((page) => page.isPublished).length,
      drafts: pages.filter((page) => !page.isPublished).length,
      categories: CATEGORY_KEYS.reduce(
        (acc, category) => {
          acc[category] = 0
          return acc
        },
        {} as Record<WikiCategory, number>,
      ),
    }

    for (const page of pages) {
      const category = page.category
      if (category && summary.categories[category] !== undefined) {
        summary.categories[category] += 1
      }
    }

    return summary
  }, [pages])

  const createPage = useCallback(
    async (input: CreateWikiPageInput) => {
      if (!workspaceId) throw new Error("Workspace is required to create wiki pages")

      setIsCreating(true)
      setError(null)

      try {
        const payload: any = {
          workspaceId,
          title: input.title,
          content: input.content,
        }
        if (input.summary !== undefined) payload.summary = input.summary
        if (input.category !== undefined) payload.category = input.category
        if (input.isPublished !== undefined) payload.isPublished = input.isPublished

        await createPageMutation(payload)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [workspaceId, createPageMutation],
  )

  const updatePage = useCallback(
    async (pageId: Id<"wiki">, patch: UpdateWikiPageInput) => {
      setIsUpdating(true)
      setError(null)

      try {
        const payload: any = {
          id: pageId,
          patch: {},
        }
        if (patch.title !== undefined) payload.patch.title = patch.title
        if (patch.content !== undefined) payload.patch.content = patch.content
        if (patch.summary !== undefined) payload.patch.summary = patch.summary
        if (patch.category !== undefined) payload.patch.category = patch.category
        if (patch.isPublished !== undefined) payload.patch.isPublished = patch.isPublished
        if (patch.regenerateSlug !== undefined) payload.patch.regenerateSlug = patch.regenerateSlug

        await updatePageMutation(payload)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [updatePageMutation],
  )

  const deletePage = useCallback(
    async (pageId: Id<"wiki">) => {
      setIsRemoving(true)
      setError(null)

      try {
        await deletePageMutation({ id: pageId })
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsRemoving(false)
      }
    },
    [deletePageMutation],
  )

  return {
    pages,
    stats,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isRemoving,
    hasWorkspace: Boolean(workspaceId),
    createPage,
    updatePage,
    deletePage,
  }
}
