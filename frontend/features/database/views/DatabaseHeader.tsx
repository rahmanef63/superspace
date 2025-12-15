"use client"

import React from "react"
import { Database, Plus, Settings, Table } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface DatabaseHeaderProps {
  onCreateDatabase?: () => void
  onManageViews?: () => void
  onSettings?: () => void
}

/**
 * DatabaseHeader Component
 * 
 * Consistent header for the Database feature.
 */
export function DatabaseHeader({
  onCreateDatabase,
  onManageViews,
  onSettings,
}: DatabaseHeaderProps) {
  return (
    <FeatureHeader
      icon={Database}
      title="Database"
      subtitle="Notion-style database views and management"
      primaryAction={{
        label: "New Database",
        icon: Plus,
        onClick: onCreateDatabase ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "views",
          label: "Views",
          icon: Table,
          onClick: onManageViews ?? (() => {}),
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

export default DatabaseHeader
