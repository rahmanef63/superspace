"use client"

import React from "react"
import { FileText, Plus, Layout } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface FormsHeaderProps {
  onCreateForm?: () => void
  onTemplates?: () => void
}

/**
 * FormsHeader Component
 * 
 * Consistent header for the Forms feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function FormsHeader({
  onCreateForm,
  onTemplates,
}: FormsHeaderProps) {
  return (
    <FeatureHeader
      icon={FileText}
      title="Forms"
      subtitle="Build custom forms for data collection"
      primaryAction={{
        label: "New Form",
        icon: Plus,
        onClick: onCreateForm ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "templates",
          label: "Templates",
          icon: Layout,
          onClick: onTemplates ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="forms"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default FormsHeader

