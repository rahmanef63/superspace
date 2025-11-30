import type { Id } from "@convex/_generated/dataModel"

export interface CalendarEvent {
  id: Id<"calendar">
  workspaceId: Id<"workspaces">
  title: string
  description?: string | null
  location?: string | null
  startsAt: number
  endsAt?: number | null
  allDay?: boolean
  createdBy?: Id<"users"> | null
  updatedBy?: Id<"users"> | null
  createdAt: number
  updatedAt: number
}

export interface CalendarStats {
  total: number
  upcoming: number
  today: number
  past: number
}

export interface CreateCalendarEventInput {
  title: string
  description?: string
  location?: string
  startsAt: number
  endsAt?: number | null
  allDay?: boolean
}

export interface UpdateCalendarEventInput {
  title?: string
  description?: string | null
  location?: string | null
  startsAt?: number
  endsAt?: number | null
  allDay?: boolean
}
