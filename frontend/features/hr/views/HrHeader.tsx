"use client"

import React from "react"
import { Users, Plus, UserPlus } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface HrHeaderProps {
  onAddEmployee?: () => void
  onRecruit?: () => void
}

/**
 * HrHeader Component
 * 
 * Consistent header for the HR Management feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function HrHeader({
  onAddEmployee,
  onRecruit,
}: HrHeaderProps) {
  return (
    <FeatureHeader
      icon={Users}
      title="HR Management"
      subtitle="Manage employees, attendance, payroll, and recruitment"
      primaryAction={{
        label: "Add Employee",
        icon: Plus,
        onClick: onAddEmployee ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "recruit",
          label: "Recruit",
          icon: UserPlus,
          onClick: onRecruit ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="hr"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default HrHeader

