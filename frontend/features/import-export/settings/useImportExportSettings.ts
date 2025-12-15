"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ImportExportSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_IMPORT_EXPORT_SETTINGS: ImportExportSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useImportExportSettingsStorage = createFeatureSettingsHook<ImportExportSettingsSchema>(
    "import-export",
    DEFAULT_IMPORT_EXPORT_SETTINGS
)
