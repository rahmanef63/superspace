/**
 * Export/Import Hook
 * Provides export/import functionality for all features
 */

import { useState, useCallback, useContext, createContext, ReactNode } from "react"
import type {
  ExportFormat,
  ExportDataType,
  ExportOption,
  ExportProperty,
  ImportRequest,
  ImportResult,
  UseExportImportReturn,
  ExportImportContextValue,
} from "@/frontend/shared/foundation/utils/export/data-export-types"
import { exportToJSON, exportToCSV, generateTemplate } from "@/frontend/shared/foundation/utils/export/data-export-engine"
import { importData, previewImport } from "@/frontend/shared/foundation/utils/export/data-import-engine"

// ============================================================================
// Context
// ============================================================================

const ExportImportContext = createContext<ExportImportContextValue | null>(null)

export function ExportImportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    isExporting: false,
    isImporting: false,
    exportProgress: 0,
    importProgress: 0,
    lastExportResult: null as any,
    lastImportResult: undefined as ImportResult | undefined,
    errors: [] as string[],
    warnings: [] as string[],
  })

  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const clearErrors = useCallback(() => {
    updateState({ errors: [] })
  }, [updateState])

  const clearWarnings = useCallback(() => {
    updateState({ warnings: [] })
  }, [updateState])

  const exportData = useCallback(async (featureId: string, request: any) => {
    // Implementation will be added
  }, [])

  const importDataAction = useCallback(async (featureId: string, request: ImportRequest) => {
    // Implementation will be added
  }, [])

  const contextValue: ExportImportContextValue = {
    ...state,
    exportData,
    importData: importDataAction,
    clearErrors,
    clearWarnings,
  }

  return (
    <ExportImportContext.Provider value={contextValue}>
      {children}
    </ExportImportContext.Provider>
  )
}

export function useExportImportContext() {
  const context = useContext(ExportImportContext)
  if (!context) {
    throw new Error("useExportImportContext must be used within ExportImportProvider")
  }
  return context
}

// ============================================================================
// Main Hook
// ============================================================================

export function useExportImport(featureId: string): UseExportImportReturn {
  const {
    isExporting,
    isImporting,
    exportProgress,
    importProgress,
    errors,
    warnings,
    clearErrors,
    clearWarnings,
  } = useExportImportContext()

  const [exportOptions] = useState<ExportOption[]>([
    {
      id: "current",
      label: "All Current Data",
      description: "Export all data in the system",
    },
    {
      id: "selected",
      label: "Selected Items",
      description: "Export only selected items",
      disabled: true,
      disabledReason: "No items selected",
    },
    {
      id: "template",
      label: "Empty Template",
      description: "Download a template for import",
    },
  ])

  const [importFormats] = useState<ExportFormat[]>(["json", "csv"])

  // Get export properties for feature
  const getExportProperties = useCallback(async (featureId: string): Promise<ExportProperty[]> => {
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Export configuration not found")
      }
      return await config.exportProperties()
    } catch (error) {
      console.error("Failed to get export properties:", error)
      return []
    }
  }, [])

  // Generate template
  const generateTemplateAction = useCallback(async (
    featureId: string,
    format: ExportFormat
  ): Promise<void> => {
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Export configuration not found")
      }

      const properties = await config.exportProperties()
      const { blob, filename } = await generateTemplate(
        properties,
        format,
        featureId,
        config.featureName,
        config.templates?.[format]?.sampleData
      )

      // Download file
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate template:", error)
      throw error
    }
  }, [])

  // Export current data
  const exportCurrentData = useCallback(async (
    featureId: string,
    format: ExportFormat,
    selectedIds?: string[]
  ): Promise<void> => {
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Export configuration not found")
      }

      // Get data
      const data = await config.exportData({
        format,
        dataType: selectedIds ? "selected" : "current",
        selectedIds,
      })

      // Get properties
      const properties = await config.exportProperties()

      // Export
      const result = format === "json"
        ? await exportToJSON(data, properties, "current", {
          featureId,
          featureName: config.featureName,
        })
        : await exportToCSV(data, properties, "current", {}, {
          featureId,
          featureName: config.featureName,
        })

      // Download file
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement("a")
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
      throw error
    }
  }, [])

  // Export selected data
  const exportSelectedData = useCallback(async (
    featureId: string,
    format: ExportFormat,
    selectedIds: string[]
  ): Promise<void> => {
    await exportCurrentData(featureId, format, selectedIds)
  }, [exportCurrentData])

  // Import from file
  const importFromFile = useCallback(async (
    featureId: string,
    file: File,
    options: any
  ): Promise<ImportResult> => {
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Import configuration not found")
      }

      const properties = await config.exportProperties()

      // Detect format
      const extension = file.name.split(".").pop()?.toLowerCase()
      const format = extension === "json" ? "json" : extension === "csv" ? "csv" : null
      if (!format) {
        throw new Error("Unsupported file format")
      }

      // Import
      const result = await importData(
        {
          format,
          file,
          options,
        },
        properties,
        [], // Pass existing data if needed
        {
          onSuccess: async (data, index) => {
            // Call feature's import function
            await config.importData({
              format,
              file,
              options,
            })
          },
        }
      )

      return result
    } catch (error) {
      console.error("Failed to import file:", error)
      throw error
    }
  }, [])

  // Validate import file
  const validateImportFile = useCallback(async (
    featureId: string,
    file: File
  ): Promise<boolean> => {
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        return false
      }

      const properties = await config.exportProperties()

      // Detect format
      const extension = file.name.split(".").pop()?.toLowerCase()
      const format = extension === "json" ? "json" : extension === "csv" ? "csv" : null
      if (!format) {
        return false
      }

      // Preview to validate
      const preview = await previewImport(file, format, properties)
      return preview.errors.length === 0
    } catch (error) {
      console.error("Failed to validate import file:", error)
      return false
    }
  }, [])

  return {
    // State
    isExporting,
    isImporting,
    exportProgress,
    importProgress,
    errors,
    warnings,

    // Data
    exportOptions,
    importFormats,

    // Actions
    generateTemplate: generateTemplateAction,
    exportCurrentData,
    exportSelectedData,
    importFromFile,
    getExportProperties,
    validateImportFile,
  }
}

// ============================================================================
// Utility Hook for Export/Import State
// ============================================================================

export function useExportImportState() {
  const [isOpen, setIsOpen] = useState({
    export: false,
    import: false,
  })
  const [format, setFormat] = useState<ExportFormat>("json")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const openExport = useCallback(() => {
    setIsOpen(prev => ({ ...prev, export: true }))
  }, [])

  const closeExport = useCallback(() => {
    setIsOpen(prev => ({ ...prev, export: false }))
  }, [])

  const openImport = useCallback(() => {
    setIsOpen(prev => ({ ...prev, import: true }))
  }, [])

  const closeImport = useCallback(() => {
    setIsOpen(prev => ({ ...prev, import: false }))
  }, [])

  return {
    isOpen,
    format,
    selectedIds,
    setFormat,
    setSelectedIds,
    openExport,
    closeExport,
    openImport,
    closeImport,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getFeatureExportConfig(featureId: string) {
  const { getFeatureExportConfig: getConfigFromRegistry } = await import(
    "@/frontend/shared/foundation/registry/data-export-registry"
  )
  return getConfigFromRegistry(featureId)
}
