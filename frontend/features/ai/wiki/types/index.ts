import type { Id } from "@convex/_generated/dataModel"

export type WikiCategory = "general" | "product" | "engineering" | "operations" | "sales" | "support"

export interface WikiPageRecord {
  id: Id<"wiki">
  workspaceId: Id<"workspaces">
  title: string
  content: string
  summary?: string | null
  category?: WikiCategory | null
  slug?: string | null
  isPublished: boolean
  createdAt: number
  updatedAt: number
  createdBy?: Id<"users"> | null
  updatedBy?: Id<"users"> | null
}

export interface WikiStats {
  total: number
  published: number
  drafts: number
  categories: Record<WikiCategory, number>
}

export interface CreateWikiPageInput {
  title: string
  content: string
  summary?: string
  category?: WikiCategory
  isPublished?: boolean
}

export interface UpdateWikiPageInput {
  title?: string
  content?: string
  summary?: string | null
  category?: WikiCategory | null
  isPublished?: boolean
  regenerateSlug?: boolean
}
