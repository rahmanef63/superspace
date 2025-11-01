"use client"

import { useConvexAuth } from "convex/react"
import { useAuth } from "@clerk/nextjs"

export function useAuthed() {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth()
  const { isSignedIn, isLoaded } = useAuth()

  // Prioritize Clerk authentication to avoid redirect loops
  // Convex auth might take a moment to sync
  const isAuthed = Boolean(isSignedIn || isAuthenticated)
  const isLoading = !isLoaded || (isSignedIn && convexLoading)

  console.log('[useAuthed]', {
    isSignedIn: Boolean(isSignedIn),
    isAuthenticated: Boolean(isAuthenticated),
    isAuthed,
    isLoading,
    clerkLoaded: isLoaded,
    convexLoading
  })

  return {
    isAuthed,
    isLoading,
    isAuthenticated: Boolean(isAuthenticated), // raw values in case callers need them
    isSignedIn: Boolean(isSignedIn),
  }
}
