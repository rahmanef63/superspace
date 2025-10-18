/**
 * Tasks Types
 */

export interface TasksItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface TasksFilter {
  query?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}
