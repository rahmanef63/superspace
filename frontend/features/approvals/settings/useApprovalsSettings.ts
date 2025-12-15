"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface ApprovalsSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_APPROVALS_SETTINGS: ApprovalsSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useApprovalsSettingsStorage = createFeatureSettingsHook<ApprovalsSettingsSchema>(
    "approvals",
    DEFAULT_APPROVALS_SETTINGS
)
