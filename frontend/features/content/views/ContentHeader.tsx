"use client"

import React from "react"
import { Library, Plus, Settings, Upload } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface ContentHeaderProps {
  onUploadContent?: () => void
  onCreateFolder?: () => void
  onSettings?: () => void
}

/**
 * ContentHeader Component
 * 
 * Consistent header for the Content Library feature.
 */
export function ContentHeader({
  onUploadContent,
  onCreateFolder,
  onSettings,
}: ContentHeaderProps) {
  return (
    <FeatureHeader
      icon={Library}
      title="Content Library"
      subtitle="Centralized content management for images, videos, audio, and documents"
      primaryAction={{
        label: "Upload",
        icon: Upload,
        onClick: onUploadContent ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "new-folder",
          label: "New Folder",
          icon: Plus,
          onClick: onCreateFolder ?? (() => {}),
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

export default ContentHeader
