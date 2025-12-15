"use client"

import React from "react"
import { FileText, Plus, Settings, Layout } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface FormsHeaderProps {
  onCreateForm?: () => void
  onTemplates?: () => void
  onSettings?: () => void
}

/**
 * FormsHeader Component
 * 
 * Consistent header for the Forms feature.
 */
export function FormsHeader({
  onCreateForm,
  onTemplates,
  onSettings,
}: FormsHeaderProps) {
  return (
    <FeatureHeader
      icon={FileText}
      title="Forms"
      subtitle="Build custom forms for data collection"
      primaryAction={{
        label: "New Form",
        icon: Plus,
        onClick: onCreateForm ?? (() => {}),
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

export default FormsHeader
