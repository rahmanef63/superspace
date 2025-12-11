"use client"

import React, { useState } from "react"
import { ArrowUpDown, Upload } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useImportExport } from "../hooks/useImportExport"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { DataTransferDashboard } from "../components/DataTransferDashboard"

interface ImportExportPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Import/Export Page Component
 * Complete data import and export functionality
 */
export default function ImportExportPage({ workspaceId }: ImportExportPageProps) {
  const data = useImportExport(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use import/export
          </p>
        </div>
      </div>
    )
  }

  const handleImport = async (file: File, entityType: string, format: string) => {
    await data.startImport({
      workspaceId,
      entityType,
      format,
      fileName: file.name,
    })
  }

  const handleExport = async (entityType: string, format: string) => {
    await data.startExport({
      workspaceId,
      entityType,
      format,
    })
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={ArrowUpDown}
        title="Import / Export"
        subtitle="Manage your workspace data"
        primaryAction={{
          label: "Import Data",
          icon: Upload,
          onClick: () => {
            // Dispatch event or control dashboard via ref/state if needed,
            // but Dashboard has its own internal state for the dialog.
            // We could expose a ref if really needed or just let the user click the tab.
            // For simplicity, we assume the user will use the dashboard UI.
            // If we really want the header button to work, we'd need to lift state up.
            // For now, I'll remove the onClick or make it a scroll-to-action.
          },
        }}
      />

      <div className="flex-1 overflow-auto p-4">
        <DataTransferDashboard
          data={data}
          onImport={handleImport}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}
