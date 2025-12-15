"use client"

import React from "react"
import { Box, Plus, Settings, FileText } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface CmsLiteHeaderProps {
  onCreateContent?: () => void
  onManageTemplates?: () => void
  onSettings?: () => void
}

/**
 * CmsLiteHeader Component
 * 
 * Consistent header for the CMS Lite feature.
 */
export function CmsLiteHeader({
  onCreateContent,
  onManageTemplates,
  onSettings,
}: CmsLiteHeaderProps) {
  return (
    <FeatureHeader
      icon={Box}
      title="CMS Lite"
      subtitle="Lightweight content management system"
      primaryAction={{
        label: "New Content",
        icon: Plus,
        onClick: onCreateContent ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "templates",
          label: "Templates",
          icon: FileText,
          onClick: onManageTemplates ?? (() => {}),
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

export default CmsLiteHeader
