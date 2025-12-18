"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { useAuthed } from "@/frontend/shared/foundation"
import { api } from "@/convex/_generated/api"

export function OnboardingGuard() {
  const { isAuthed, isLoading } = useAuthed()
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const backfillMemberships = useMutation(api.workspace.workspaces.backfillMembershipsForCurrentUser as any)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Track backfill state
  const [backfillState, setBackfillState] = useState<'idle' | 'running' | 'done-found' | 'done-empty'>('idle')

  const workspacesLoaded = userWorkspaces !== undefined
  const hasWorkspaces = Array.isArray(userWorkspaces) && userWorkspaces.length > 0

  useEffect(() => {
    // Wait for auth and data to load
    if (isLoading) return
    if (!workspacesLoaded) return
    if (!isAuthed) return
    
    // Don't redirect if already on workspace page or just onboarded
    const justOnboarded = searchParams?.get("onboarded") === "1"
    if (justOnboarded) return
    if (pathname?.startsWith("/dashboard/workspace")) return
    
    // If user HAS workspaces, we're good - no action needed
    if (hasWorkspaces) {
      // Reset state for next time
      if (backfillState !== 'idle') setBackfillState('idle')
      return
    }
    
    // User has NO workspaces - handle backfill flow
    switch (backfillState) {
      case 'idle':
        // First time seeing no workspaces - try backfill
        setBackfillState('running')
        backfillMemberships({})
          .then((result: any) => {
            if (result && result.found > 0) {
              // Backfill found workspaces, query will update automatically
              console.log("OnboardingGuard: Backfill found", result.found, "workspaces")
              setBackfillState('done-found')
            } else {
              // No workspaces at all
              console.log("OnboardingGuard: No workspaces found")
              setBackfillState('done-empty')
            }
          })
          .catch((err) => {
            console.error('OnboardingGuard:backfillMemberships error', err)
            setBackfillState('done-empty')
          })
        break
        
      case 'running':
        // Backfill in progress, wait
        break
        
      case 'done-found':
        // Backfill found workspaces but query hasn't updated yet - wait
        // The query subscription will update and hasWorkspaces will become true
        break
        
      case 'done-empty':
        // Backfill complete and confirmed no workspaces - redirect
        router.replace("/dashboard/workspace")
        break
    }
  }, [isLoading, workspacesLoaded, isAuthed, hasWorkspaces, pathname, router, searchParams, backfillMemberships, backfillState])

  return null
}
