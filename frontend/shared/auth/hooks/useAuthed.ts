"use client"

import { useConvexAuth } from "convex/react"
import { useAuth } from "@clerk/nextjs"

export function useAuthed() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { isSignedIn } = useAuth()

  return {
    isAuthed: Boolean(isAuthenticated || isSignedIn),
    isLoading,
    isAuthenticated, // raw values in case callers need them
    isSignedIn: Boolean(isSignedIn),
  }
}
