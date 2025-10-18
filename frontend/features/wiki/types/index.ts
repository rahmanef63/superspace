/**
 * Wiki Types
 */

export interface WikiItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface WikiFilter {
  query?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}
