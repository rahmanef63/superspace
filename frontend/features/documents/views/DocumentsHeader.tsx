"use client"

import React from "react"
import { FileText, Plus, Upload } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface DocumentsHeaderProps {
  onCreateDocument?: () => void
  onUpload?: () => void
}

/**
 * DocumentsHeader Component
 * 
 * Consistent header for the Documents feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function DocumentsHeader({
  onCreateDocument,
  onUpload,
}: DocumentsHeaderProps) {
  return (
    <FeatureHeader
      icon={FileText}
      title="Documents"
      subtitle="Collaborative document editor with real-time sync"
      primaryAction={{
        label: "New Document",
        icon: Plus,
        onClick: onCreateDocument ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "upload",
          label: "Upload",
          icon: Upload,
          onClick: onUpload ?? (() => { }),
        },
      ]}
    >
      {/* Feature Settings & AI Assistant */}
      <FeatureHeaderActions
        featureSlug="docs"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default DocumentsHeader

