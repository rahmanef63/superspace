"use client"

import React from "react"
import { Shield, Settings, Users, Cog } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface PlatformAdminHeaderProps {
  onManageUsers?: () => void
  onSystemConfig?: () => void
  onSettings?: () => void
}

/**
 * PlatformAdminHeader Component
 * 
 * Consistent header for the Platform Admin feature.
 */
export function PlatformAdminHeader({
  onManageUsers,
  onSystemConfig,
  onSettings,
}: PlatformAdminHeaderProps) {
  return (
    <FeatureHeader
      icon={Shield}
      title="Platform Admin"
      subtitle="Super Admin panel for managing features, workspaces, and system configuration"
      secondaryActions={[
        {
          id: "users",
          label: "Users",
          icon: Users,
          onClick: onManageUsers ?? (() => {}),
        },
        {
          id: "config",
          label: "Config",
          icon: Cog,
          onClick: onSystemConfig ?? (() => {}),
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

export default PlatformAdminHeader
