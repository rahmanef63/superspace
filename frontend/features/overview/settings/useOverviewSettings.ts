"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface OverviewSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_OVERVIEW_SETTINGS: OverviewSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useOverviewSettingsStorage = createFeatureSettingsHook<OverviewSettingsSchema>(
    "overview",
    DEFAULT_OVERVIEW_SETTINGS
)
