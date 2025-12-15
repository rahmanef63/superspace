"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface POSSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_POS_SETTINGS: POSSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const usePOSSettingsStorage = createFeatureSettingsHook<POSSettingsSchema>(
    "pos",
    DEFAULT_POS_SETTINGS
)
