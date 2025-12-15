"use client"

import React from "react"
import { History, Download, Filter, Settings } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface AuditLogHeaderProps {
  onExport?: () => void
  onFilter?: () => void
  onSettings?: () => void
}

/**
 * AuditLogHeader Component
 * 
 * Consistent header for the Audit Log feature.
 */
export function AuditLogHeader({
  onExport,
  onFilter,
  onSettings,
}: AuditLogHeaderProps) {
  return (
    <FeatureHeader
      icon={History}
      title="Audit Log"
      subtitle="View activity logs and audit trail"
      secondaryActions={[
        {
          id: "export",
          label: "Export",
          icon: Download,
          onClick: onExport ?? (() => {}),
        },
        {
          id: "filter",
          label: "Filter",
          icon: Filter,
          onClick: onFilter ?? (() => {}),
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

export default AuditLogHeader
