"use client"

import React from "react"
import { Database, Plus, Table } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface DatabaseHeaderProps {
  onCreateDatabase?: () => void
  onManageViews?: () => void
}

/**
 * DatabaseHeader Component
 * 
 * Consistent header for the Database feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function DatabaseHeader({
  onCreateDatabase,
  onManageViews,
}: DatabaseHeaderProps) {
  return (
    <FeatureHeader
      icon={Database}
      title="Database"
      subtitle="Notion-style database views and management"
      primaryAction={{
        label: "New Database",
        icon: Plus,
        onClick: onCreateDatabase ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "views",
          label: "Views",
          icon: Table,
          onClick: onManageViews ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="database"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default DatabaseHeader

