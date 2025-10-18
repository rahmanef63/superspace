/**
 * Calendar Types
 */

export interface CalendarItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface CalendarFilter {
  query?: string
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}
