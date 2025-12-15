"use client"

import React from "react"
import { UserCog, Plus, Settings, Shield } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface UserManagementHeaderProps {
  onInviteUser?: () => void
  onManageRoles?: () => void
  onSettings?: () => void
}

/**
 * UserManagementHeader Component
 * 
 * Consistent header for the User Management feature.
 */
export function UserManagementHeader({
  onInviteUser,
  onManageRoles,
  onSettings,
}: UserManagementHeaderProps) {
  return (
    <FeatureHeader
      icon={UserCog}
      title="User Management"
      subtitle="Unified user management: members, teams, invitations, and role hierarchy"
      primaryAction={{
        label: "Invite User",
        icon: Plus,
        onClick: onInviteUser ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "roles",
          label: "Roles",
          icon: Shield,
          onClick: onManageRoles ?? (() => {}),
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

export default UserManagementHeader
