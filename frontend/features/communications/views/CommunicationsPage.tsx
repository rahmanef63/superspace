/**
 * Communications Page
 * 
 * Main page component for the unified communications feature.
 * Wraps CommunicationsView with workspace context and providers.
 * 
 * @module features/communications/views
 */

"use client"

import * as React from "react"
import { MessageSquare } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { CommunicationsView } from "./CommunicationsView"
import { useCommunications } from "../hooks/useCommunications"
import { useSampleData } from "../hooks/useSampleData"
import { CreateChannelDialog } from "../components/CreateChannelDialog"
import { useCommunicationsStore } from "../shared"

interface CommunicationsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Communications Page Component
 * 
 * Pattern: Feature page with shared layout components
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 */
export default function CommunicationsPage({ workspaceId }: CommunicationsPageProps) {
  // Initialize sample data for demo
  // useSampleData()

  // Use hook with workspaceId
  const { isLoading } = useCommunications(workspaceId)

  // Modal state - use selector for stable reference
  const activeModal = useCommunicationsStore(state => state.ui.activeModal)
  const closeModal = useCommunicationsStore(state => state.closeModal)

  // Handle no workspace - still show with sample data
  if (!workspaceId) {
    return (
      <TooltipProvider>
        <div className="flex h-full flex-col">
          <CommunicationsView 
            workspaceId="demo"
            className="flex-1"
          />
          {/* Create Channel Modal */}
          <CreateChannelDialog
            open={activeModal === "create-channel"}
            onOpenChange={(open) => !open && closeModal()}
          />
        </div>
      </TooltipProvider>
    )
  }

  // Handle loading
  if (isLoading) {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading Communications...</p>
        </div>
      </PageContainer>
    )
  }

  // Main content
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <CommunicationsView 
          workspaceId={workspaceId as string}
          className="flex-1"
        />
        {/* Create Channel Modal */}
        <CreateChannelDialog
          open={activeModal === "create-channel"}
          onOpenChange={(open) => !open && closeModal()}
        />
      </div>
    </TooltipProvider>
  )
}
