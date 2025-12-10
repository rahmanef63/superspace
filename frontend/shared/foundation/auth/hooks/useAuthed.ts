"use client"

import { useConvexAuth } from "convex/react"
import { useAuth } from "@clerk/nextjs"

export function useAuthed() {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth()
  const { isSignedIn, isLoaded } = useAuth()

  // Wait for Clerk to fully load first
  // Only show "not authenticated" after Clerk has loaded
  const isLoading = !isLoaded || convexLoading

  // User is authed if Clerk says signed in OR Convex says authenticated
  // But only trust this after loading is complete
  const isAuthed = isLoading ? false : Boolean(isSignedIn || isAuthenticated)



  return {
    isAuthed,
    isLoading,
    isAuthenticated: Boolean(isAuthenticated), // raw values in case callers need them
    isSignedIn: Boolean(isSignedIn),
  }
}
