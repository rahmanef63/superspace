"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface CmsLiteSettingsSchema {
    notificationsEnabled: boolean
}

export const DEFAULT_cmsLite_SETTINGS: CmsLiteSettingsSchema = {
    notificationsEnabled: true
}

export const useCmsLiteSettingsStorage = createFeatureSettingsHook<CmsLiteSettingsSchema>(
    "cms-lite",
    DEFAULT_cmsLite_SETTINGS
)
