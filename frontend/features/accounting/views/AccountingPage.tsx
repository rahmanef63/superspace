"use client"

import React from "react"
import { Calculator, Plus, Settings, FileText } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useAccounting } from "../hooks/useAccounting"

interface AccountingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Accounting Page Component
 * 
 * Pattern: Feature page with shared layout components
 * @see docs/guides/three-column-layout-usage.md for complex layouts
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
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

  if (isLoading) {
    return (
      <PageContainer centered>
        <div className="text-muted-foreground">Loading Accounting...</div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Calculator}
        title="Accounting"
        subtitle="Financial management, transactions, invoices, and reports"
        badge={{ text: "Beta", variant: "secondary" }}
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
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <Calculator className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium">Accounting feature is under development</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coming soon with chart of accounts, journal entries, GL, AP/AR, and budgets
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center max-w-md mx-auto">
              <p className="text-muted-foreground">
                Start building your accounting feature here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
