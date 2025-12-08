"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Contacts Settings Schema
 */
export interface ContactsSettingsSchema {
    // General
    defaultView: "list" | "grid" | "table"
    sortBy: "name" | "company" | "recent" | "added"
    sortOrder: "asc" | "desc"

    // Display
    showPhotos: boolean
    showCompany: boolean
    showTags: boolean
    showLastContact: boolean
    cardSize: "compact" | "normal" | "large"

    // Import/Export
    defaultExportFormat: "csv" | "vcf" | "xlsx"
    duplicateHandling: "skip" | "merge" | "create"

    // Privacy
    requireConfirmDelete: boolean
    showPrivateContacts: boolean
}

export const DEFAULT_CONTACTS_SETTINGS: ContactsSettingsSchema = {
    // General
    defaultView: "list",
    sortBy: "name",
    sortOrder: "asc",

    // Display
    showPhotos: true,
    showCompany: true,
    showTags: true,
    showLastContact: true,
    cardSize: "normal",

    // Import/Export
    defaultExportFormat: "csv",
    duplicateHandling: "merge",

    // Privacy
    requireConfirmDelete: true,
    showPrivateContacts: false,
}

export const useContactsSettingsStorage = createFeatureSettingsHook<ContactsSettingsSchema>(
    "contacts",
    DEFAULT_CONTACTS_SETTINGS
)
