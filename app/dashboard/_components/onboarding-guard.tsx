"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { useAuthed } from "@/frontend/shared/auth/hooks/useAuthed"
import { api } from "@/convex/_generated/api"

export function OnboardingGuard() {
  const { isAuthed, isLoading, isAuthenticated, isSignedIn } = useAuthed()
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const backfillMemberships = useMutation(api.workspace.workspaces.backfillMembershipsForCurrentUser as any)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const backfillAttemptedRef = useRef(false)

  const workspacesLoaded = userWorkspaces !== undefined
  const hasNoWorkspaces = Array.isArray(userWorkspaces) && userWorkspaces.length === 0

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Helpful debug during development
      console.debug('OnboardingGuard', {
        isLoading,
        isAuthenticated,
        workspacesLoaded,
        workspacesCount: Array.isArray(userWorkspaces) ? userWorkspaces.length : 'undef',
        pathname,
      })
    }
    if (isLoading) return
    if (!workspacesLoaded) return
    if (!isAuthed) return
    // If we just onboarded and have a marker in the URL, don't bounce back
    const justOnboarded = searchParams?.get("onboarded") === "1"
    if (justOnboarded) return
    if (pathname?.startsWith("/dashboard/workspace")) return
    if (hasNoWorkspaces) {
      // Try to backfill memberships for workspaces the user created (once)
      if (!backfillAttemptedRef.current) {
        backfillAttemptedRef.current = true
        backfillMemberships({})
          .then((res) => {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('OnboardingGuard:backfillMemberships result', res)
            }
          })
          .catch((err) => {
            console.error('OnboardingGuard:backfillMemberships error', err)
          })
        return
      }
      router.replace("/dashboard/workspace")
    }
  }, [isLoading, workspacesLoaded, isAuthed, isAuthenticated, isSignedIn, hasNoWorkspaces, pathname, router, searchParams, backfillMemberships])

  return null
}
