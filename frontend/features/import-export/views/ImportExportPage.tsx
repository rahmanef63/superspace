"use client"

import React, { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useImportExport } from "../hooks/useImportExport"
import { DataTransferDashboard } from "../components/DataTransferDashboard"
import { ImportExportHeader } from "./ImportExportHeader"

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
      <ImportExportHeader />

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
