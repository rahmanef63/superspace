"use client"

import React from "react"
import { FileText, Plus, Settings, Upload } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface DocumentsHeaderProps {
  onCreateDocument?: () => void
  onUpload?: () => void
  onSettings?: () => void
}

/**
 * DocumentsHeader Component
 * 
 * Consistent header for the Documents feature.
 */
export function DocumentsHeader({
  onCreateDocument,
  onUpload,
  onSettings,
}: DocumentsHeaderProps) {
  return (
    <FeatureHeader
      icon={FileText}
      title="Documents"
      subtitle="Collaborative document editor with real-time sync"
      primaryAction={{
        label: "New Document",
        icon: Plus,
        onClick: onCreateDocument ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "upload",
          label: "Upload",
          icon: Upload,
          onClick: onUpload ?? (() => {}),
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

export default DocumentsHeader
