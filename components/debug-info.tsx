"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect } from "react"

export function DebugInfo() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    console.log("[v0] Clerk Debug Info:", {
      isLoaded,
      userId,
      sessionId,
      hasUser: !!user,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "Missing",
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ? "Set" : "Missing",
    })

    if (isLoaded && userId) {
      getToken()
        .then((token) => {
          console.log("[v0] JWT Token:", token ? "Present" : "Missing")
        })
        .catch((error) => {
          console.log("[v0] JWT Token Error:", error)
        })
    }
  }, [isLoaded, userId, sessionId, user, getToken])

  return null
}
