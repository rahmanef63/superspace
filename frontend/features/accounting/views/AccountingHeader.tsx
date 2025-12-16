"use client"

import React from "react"
import { Calculator, Plus, FileText } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface AccountingHeaderProps {
  onNewTransaction?: () => void
  onViewReports?: () => void
}

/**
 * AccountingHeader Component
 * 
 * Consistent header for the Accounting feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function AccountingHeader({
  onNewTransaction,
  onViewReports,
}: AccountingHeaderProps) {
  return (
    <FeatureHeader
      icon={Calculator}
      title="Accounting"
      subtitle="Financial management, transactions, invoices, and reports"
      primaryAction={{
        label: "New Transaction",
        icon: Plus,
        onClick: onNewTransaction ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "reports",
          label: "Reports",
          icon: FileText,
          onClick: onViewReports ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="accounting"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default AccountingHeader

