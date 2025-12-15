"use client"

import React from "react"
import { Users, Plus, Settings, UserPlus } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface HrHeaderProps {
  onAddEmployee?: () => void
  onRecruit?: () => void
  onSettings?: () => void
}

/**
 * HrHeader Component
 * 
 * Consistent header for the HR Management feature.
 */
export function HrHeader({
  onAddEmployee,
  onRecruit,
  onSettings,
}: HrHeaderProps) {
  return (
    <FeatureHeader
      icon={Users}
      title="HR Management"
      subtitle="Manage employees, attendance, payroll, and recruitment"
      primaryAction={{
        label: "Add Employee",
        icon: Plus,
        onClick: onAddEmployee ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "recruit",
          label: "Recruit",
          icon: UserPlus,
          onClick: onRecruit ?? (() => {}),
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

export default HrHeader
