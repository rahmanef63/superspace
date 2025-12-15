"use client"

import React from "react"
import { Bot, Plus, Sparkles } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface AiHeaderProps {
  onNewChat?: () => void
  onManageAgents?: () => void
}

/**
 * AiHeader Component
 * 
 * Consistent header for the AI feature.
 */
export function AiHeader({
  onNewChat,
  onManageAgents,
}: AiHeaderProps) {
  return (
    <FeatureHeader
      icon={Bot}
      title="AI"
      subtitle="AI assistant for your workspace"
      primaryAction={{
        label: "New Chat",
        icon: Plus,
        onClick: onNewChat ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "agents",
          label: "Agents",
          icon: Sparkles,
          onClick: onManageAgents ?? (() => { }),
        }
      ]}
    />
  )
}

export default AiHeader
