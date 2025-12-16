"use client"

import React from "react"
import { FolderKanban, Plus, BarChart3 } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface ProjectsHeaderProps {
  onCreateProject?: () => void
  onViewReports?: () => void
}

/**
 * ProjectsHeader Component
 * 
 * Consistent header for the Projects feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function ProjectsHeader({
  onCreateProject,
  onViewReports,
}: ProjectsHeaderProps) {
  return (
    <FeatureHeader
      icon={FolderKanban}
      title="Projects"
      subtitle="Project management with team discussions"
      primaryAction={{
        label: "New Project",
        icon: Plus,
        onClick: onCreateProject ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          onClick: onViewReports ?? (() => { }),
        },
      ]}
    >
      {/* Feature Settings & AI Assistant */}
      <FeatureHeaderActions
        featureSlug="projects"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default ProjectsHeader

