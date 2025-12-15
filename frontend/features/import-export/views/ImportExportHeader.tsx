"use client"

import React from "react"
import { ArrowUpDown, Upload, Download, Settings } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface ImportExportHeaderProps {
  onImport?: () => void
  onExport?: () => void
  onSettings?: () => void
}

/**
 * ImportExportHeader Component
 * 
 * Consistent header for the Import/Export feature.
 */
export function ImportExportHeader({
  onImport,
  onExport,
  onSettings,
}: ImportExportHeaderProps) {
  return (
    <FeatureHeader
      icon={ArrowUpDown}
      title="Import/Export"
      subtitle="Import and export data across workspace"
      primaryAction={{
        label: "Import",
        icon: Upload,
        onClick: onImport ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "export",
          label: "Export",
          icon: Download,
          onClick: onExport ?? (() => {}),
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

export default ImportExportHeader
