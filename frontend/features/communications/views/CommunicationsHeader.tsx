"use client"

import React from "react"
import { MessageSquare, Plus, Settings, Phone } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface CommunicationsHeaderProps {
  onNewMessage?: () => void
  onStartCall?: () => void
  onSettings?: () => void
}

/**
 * CommunicationsHeader Component
 * 
 * Consistent header for the Communications feature.
 */
export function CommunicationsHeader({
  onNewMessage,
  onStartCall,
  onSettings,
}: CommunicationsHeaderProps) {
  return (
    <FeatureHeader
      icon={MessageSquare}
      title="Communications"
      subtitle="Unified communication platform with channels, direct messages, voice/video calls"
      primaryAction={{
        label: "New Message",
        icon: Plus,
        onClick: onNewMessage ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "call",
          label: "Start Call",
          icon: Phone,
          onClick: onStartCall ?? (() => {}),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          onClick: onSettings ?? (() => {}),
        },
      ]}
    />
  )
}

export default CommunicationsHeader
