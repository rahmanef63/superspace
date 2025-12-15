"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface CommunicationsSettingsSchema {
    notificationsEnabled: boolean
}

export const DEFAULT_COMMUNICATIONS_SETTINGS: CommunicationsSettingsSchema = {
    notificationsEnabled: true
}

export const useCommunicationsSettingsStorage = createFeatureSettingsHook<CommunicationsSettingsSchema>(
    "communications",
    DEFAULT_COMMUNICATIONS_SETTINGS
)
