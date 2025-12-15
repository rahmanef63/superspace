"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface IntegrationsSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_INTEGRATIONS_SETTINGS: IntegrationsSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useIntegrationsSettingsStorage = createFeatureSettingsHook<IntegrationsSettingsSchema>(
    "integrations",
    DEFAULT_INTEGRATIONS_SETTINGS
)
