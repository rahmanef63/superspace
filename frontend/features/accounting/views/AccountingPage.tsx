"use client"

import React from "react"
import { Calculator, Plus, Settings, FileText } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useAccounting } from "../hooks/useAccounting"
import AccountingDashboard from "../components/AccountingDashboard"

interface AccountingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Accounting Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses AccountingDashboard for presentation
 */
export default function AccountingPage({ workspaceId }: AccountingPageProps) {
  // Use hook with workspaceId - this is the correct pattern
  const { isLoading, data } = useAccounting(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Accounting
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Calculator}
        title="Accounting"
        subtitle="Financial management, transactions, invoices, and reports"
        primaryAction={{
          label: "New Transaction",
          icon: Plus,
          onClick: () => { },
        }}
        secondaryActions={[
          {
            id: "reports",
            label: "Reports",
            icon: FileText,
            onClick: () => { },
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => { },
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <AccountingDashboard data={data} isLoading={isLoading} />
      </div>
    </div>
  )
}
