"use client"

import React from "react"
import { Hammer, Plus, Settings, Layout } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface BuilderHeaderProps {
  onCreateApp?: () => void
  onTemplates?: () => void
  onSettings?: () => void
}

/**
 * BuilderHeader Component
 * 
 * Consistent header for the Builder feature.
 */
export function BuilderHeader({
  onCreateApp,
  onTemplates,
  onSettings,
}: BuilderHeaderProps) {
  return (
    <FeatureHeader
      icon={Hammer}
      title="Builder"
      subtitle="Build apps, content, and interfaces with visual builder tools"
      primaryAction={{
        label: "New App",
        icon: Plus,
        onClick: onCreateApp ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "templates",
          label: "Templates",
          icon: Layout,
          onClick: onTemplates ?? (() => {}),
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

export default BuilderHeader
