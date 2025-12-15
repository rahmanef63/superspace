"use client"

import React from "react"
import { FolderKanban, Plus, Settings, BarChart3 } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface ProjectsHeaderProps {
  onCreateProject?: () => void
  onViewReports?: () => void
  onSettings?: () => void
}

/**
 * ProjectsHeader Component
 * 
 * Consistent header for the Projects feature.
 */
export function ProjectsHeader({
  onCreateProject,
  onViewReports,
  onSettings,
}: ProjectsHeaderProps) {
  return (
    <FeatureHeader
      icon={FolderKanban}
      title="Projects"
      subtitle="Project management with team discussions"
      primaryAction={{
        label: "New Project",
        icon: Plus,
        onClick: onCreateProject ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          onClick: onViewReports ?? (() => {}),
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

export default ProjectsHeader
