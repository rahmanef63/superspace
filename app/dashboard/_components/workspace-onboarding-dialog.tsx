"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { useAuthed } from "@/frontend/shared/auth/hooks/useAuthed"
import { api } from "@/convex/_generated/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { OnboardingFlow } from "@/frontend/views/static/workspaces"
import type { Id } from "@/convex/_generated/dataModel"

export function WorkspaceOnboardingDialog() {
  const { isAuthed, isLoading, isAuthenticated, isSignedIn } = useAuthed()
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const pathname = usePathname()

  const workspacesLoaded = userWorkspaces !== undefined
  const hasNoWorkspaces = useMemo(() => Array.isArray(userWorkspaces) && userWorkspaces.length === 0, [userWorkspaces])

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('WorkspaceOnboardingDialog', {
        isLoading,
        isAuthenticated,
        workspacesLoaded,
        hasNoWorkspaces,
        pathname,
      })
    }
    if (isLoading) return
    if (!workspacesLoaded) return
    if (isAuthed && hasNoWorkspaces && !pathname?.startsWith("/dashboard/workspace")) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [isLoading, workspacesLoaded, isAuthed, isAuthenticated, isSignedIn, hasNoWorkspaces, pathname])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create your first workspace</DialogTitle>
          <DialogDescription>We’ll help you get set up in a minute.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-auto pr-2">
          <OnboardingFlow
            variant="dialog"
            onComplete={async (workspaceId: Id<"workspaces">) => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('[OnboardingDialog] onComplete', { workspaceId })
              }
              setOpen(false)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
