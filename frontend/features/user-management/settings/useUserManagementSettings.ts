"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

export interface UserManagementSettingsSchema {
    notificationsEnabled: boolean
    autoSave: boolean
}

export const DEFAULT_USER_MANAGEMENT_SETTINGS: UserManagementSettingsSchema = {
    notificationsEnabled: true,
    autoSave: true
}

export const useUserManagementSettingsStorage = createFeatureSettingsHook<UserManagementSettingsSchema>(
    "user-management",
    DEFAULT_USER_MANAGEMENT_SETTINGS
)
