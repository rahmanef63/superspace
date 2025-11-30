import { useCallback, useMemo, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type {
  CalendarEvent,
  CalendarStats,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "../types"

/**
 * Calendar Hook
 *
 * Provides data and actions for the calendar feature.
 */
export function useCalendar(workspaceId?: Id<"workspaces"> | null) {
  const [error, setError] = useState<Error | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const eventsQuery = useQuery(
    api.features.calendar.queries.list as any,
    workspaceId ? { workspaceId } : "skip",
  )

  const createEventMutation = useMutation(api.features.calendar.mutations.create as any)
  const updateEventMutation = useMutation(api.features.calendar.mutations.update as any)
  const deleteEventMutation = useMutation(api.features.calendar.mutations.remove as any)

  const isLoading = workspaceId ? eventsQuery === undefined : false

  const events = useMemo<CalendarEvent[]>(() => {
    if (!eventsQuery) return []
    return eventsQuery.map((event) => ({
      id: event._id,
      workspaceId: event.workspaceId,
      title: event.title,
      description: event.description ?? null,
      location: event.location ?? null,
      startsAt: event.startsAt,
      endsAt: event.endsAt ?? null,
      allDay: event.allDay ?? false,
      createdBy: event.createdBy ?? null,
      updatedBy: event.updatedBy ?? null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }))
  }, [eventsQuery])

  const stats = useMemo<CalendarStats>(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = startOfDay.getTime() + 86_400_000 - 1
    const start = startOfDay.getTime()

    const total = events.length
    let today = 0
    let upcoming = 0
    let past = 0

    for (const event of events) {
      const eventStart = event.startsAt
      const eventEnd = event.endsAt ?? eventStart

      if (eventEnd < start) {
        past += 1
      } else if (eventStart > endOfDay) {
        upcoming += 1
      } else {
        today += 1
      }
    }

    return { total, upcoming, today, past }
  }, [events])

  const createEvent = useCallback(
    async (input: CreateCalendarEventInput) => {
      if (!workspaceId) throw new Error("Workspace is required to create events")

      setIsCreating(true)
      setError(null)

      try {
        const payload: any = {
          workspaceId,
          title: input.title,
          startsAt: input.startsAt,
        }
        if (input.description !== undefined) payload.description = input.description
        if (input.location !== undefined) payload.location = input.location
        if (input.endsAt !== undefined && input.endsAt !== null) payload.endsAt = input.endsAt
        if (input.allDay !== undefined) payload.allDay = input.allDay

        await createEventMutation(payload)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    [workspaceId, createEventMutation],
  )

  const updateEvent = useCallback(
    async (eventId: Id<"calendar">, patch: UpdateCalendarEventInput) => {
      setIsUpdating(true)
      setError(null)

      try {
        const payload: any = { id: eventId, patch: {} }

        if (patch.title !== undefined) payload.patch.title = patch.title
        if (patch.description !== undefined) payload.patch.description = patch.description
        if (patch.location !== undefined) payload.patch.location = patch.location
        if (patch.startsAt !== undefined) payload.patch.startsAt = patch.startsAt
        if (patch.endsAt !== undefined) payload.patch.endsAt = patch.endsAt
        if (patch.allDay !== undefined) payload.patch.allDay = patch.allDay

        await updateEventMutation(payload)
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [updateEventMutation],
  )

  const deleteEvent = useCallback(
    async (eventId: Id<"calendar">) => {
      setIsRemoving(true)
      setError(null)

      try {
        await deleteEventMutation({ id: eventId })
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsRemoving(false)
      }
    },
    [deleteEventMutation],
  )

  return {
    events,
    stats,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isRemoving,
    hasWorkspace: Boolean(workspaceId),
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
