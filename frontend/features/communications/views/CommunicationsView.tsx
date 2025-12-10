/**
 * Communications View
 * 
 * Main view for the communications feature with premium UI.
 * Uses unified CommunicationSidebar for both channels and DMs.
 * 
 * @module features/communications/views
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// Shared layout components - SSOT
import {
  ThreeColumnLayout,
} from "@/frontend/shared/ui/layout"

// Communications store
import {
  useCommunicationsStore,
  useSelectedChannelId,
  useSelectedDirectId,
  useActiveCall,
  useViewMode,
  useRightPanelOpen,
} from "../shared"

// Section components
import { CommunicationSidebar } from "../sections/CommunicationSidebar"
import { MessageArea } from "../sections/MessageArea"
import { InspectorPanel } from "../sections/InspectorPanel"
import { CallView } from "../sections/CallView"

// Empty state component
function EmptyState({
  title = "No selection",
  description = "Select a channel or conversation to start"
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

interface CommunicationsViewProps {
  /** Initial view mode */
  defaultMode?: "channel" | "dm" | "call"
  /** Workspace ID */
  workspaceId?: string
  /** Workspace Name */
  workspaceName?: string
  /** Additional class names */
  className?: string
}

/**
 * Main Communications View
 * 
 * Uses unified CommunicationSidebar for both channels and DMs.
 * Same layout structure regardless of view mode (DRY).
 */
export function CommunicationsView({
  defaultMode = "channel",
  workspaceId,
  workspaceName = "Superspace",
  className,
}: CommunicationsViewProps) {
  const isMobile = useIsMobile()

  // Store state
  const viewMode = useViewMode()
  const selectedChannelId = useSelectedChannelId()
  const selectedDirectId = useSelectedDirectId()
  const activeCall = useActiveCall()
  const rightPanelOpen = useRightPanelOpen()

  const setViewMode = useCommunicationsStore(state => state.setViewMode)

  // Set initial mode
  React.useEffect(() => {
    if (defaultMode) {
      setViewMode(defaultMode)
    }
  }, [defaultMode, setViewMode])

  // Determine selections
  const hasChannelSelection = !!selectedChannelId
  const hasDirectSelection = !!selectedDirectId
  const hasCallActive = !!activeCall

  // Determine current sidebar mode
  const sidebarMode = viewMode === "dm" ? "dms" : "channels"

  // Determine if we have a valid selection for current mode
  const hasSelection = viewMode === "dm" ? hasDirectSelection : hasChannelSelection

  // Active call overlay takes precedence
  if (hasCallActive && viewMode === "call") {
    return (
      <div className={cn("h-full w-full", className)}>
        <CallView />
      </div>
    )
  }

  // Unified layout for both channels and DMs (DRY)
  return (
    <ThreeColumnLayout
      className={className}
      left={
        <CommunicationSidebar
          mode={sidebarMode}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
        />
      }
      center={
        hasSelection ? (
          <MessageArea type={viewMode === "dm" ? "direct" : "channel"} />
        ) : (
          <EmptyState
            title={viewMode === "dm" ? "No conversation selected" : "No channel selected"}
            description={viewMode === "dm"
              ? "Select a conversation from the sidebar"
              : "Select a channel from the sidebar"
            }
          />
        )
      }
      right={
        rightPanelOpen && hasSelection ? (
          <InspectorPanel />
        ) : null
      }
      leftWidth={280}
      rightWidth={rightPanelOpen ? 280 : 0}
    />
  )
}

export default CommunicationsView
