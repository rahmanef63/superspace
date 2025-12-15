"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface CmsLiteSettingsSchema {
    notificationsEnabled: boolean
}

export const DEFAULT_CMS_LITE_SETTINGS: CmsLiteSettingsSchema = {
    notificationsEnabled: true
}

export const useCmsLiteSettingsStorage = createFeatureSettingsHook<CmsLiteSettingsSchema>(
    "cms-lite",
    DEFAULT_CMS_LITE_SETTINGS
)
