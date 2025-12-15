"use client"

import React from "react"
import { Calculator, Plus, FileText, Settings } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface AccountingHeaderProps {
  onNewTransaction?: () => void
  onViewReports?: () => void
  onSettings?: () => void
}

/**
 * AccountingHeader Component
 * 
 * Consistent header for the Accounting feature.
 * Extracted from AccountingPage for reusability and consistency.
 */
export function AccountingHeader({
  onNewTransaction,
  onViewReports,
  onSettings,
}: AccountingHeaderProps) {
  return (
    <FeatureHeader
      icon={Calculator}
      title="Accounting"
      subtitle="Financial management, transactions, invoices, and reports"
      primaryAction={{
        label: "New Transaction",
        icon: Plus,
        onClick: onNewTransaction ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "reports",
          label: "Reports",
          icon: FileText,
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

export default AccountingHeader
