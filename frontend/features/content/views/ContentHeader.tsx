"use client"

import React from "react"
import { Library, Plus, Upload } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface ContentHeaderProps {
  onUploadContent?: () => void
  onCreateFolder?: () => void
}

/**
 * ContentHeader Component
 * 
 * Consistent header for the Content Library feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function ContentHeader({
  onUploadContent,
  onCreateFolder,
}: ContentHeaderProps) {
  return (
    <FeatureHeader
      icon={Library}
      title="Content Library"
      subtitle="Centralized content management for images, videos, audio, and documents"
      primaryAction={{
        label: "Upload",
        icon: Upload,
        onClick: onUploadContent ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "new-folder",
          label: "New Folder",
          icon: Plus,
          onClick: onCreateFolder ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="content"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default ContentHeader

