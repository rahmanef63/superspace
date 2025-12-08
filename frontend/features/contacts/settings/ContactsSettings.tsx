"use client"

/**
 * Contacts Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useContactsSettingsStorage } from "./useContactsSettings"
import {
    SettingsToggle,
    SettingsSelect,
} from "@/frontend/shared/settings/primitives"

export function ContactsGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useContactsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure contact defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="view"
                        label="Default View"
                        description="How contacts are displayed"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "list", label: "List" },
                            { value: "grid", label: "Grid" },
                            { value: "table", label: "Table" },
                        ]}
                    />

                    <SettingsSelect
                        id="sort-by"
                        label="Sort By"
                        description="Default sorting"
                        value={settings.sortBy}
                        onValueChange={(v) => updateSetting("sortBy", v as typeof settings.sortBy)}
                        options={[
                            { value: "name", label: "Name" },
                            { value: "company", label: "Company" },
                            { value: "recent", label: "Recently Viewed" },
                            { value: "added", label: "Date Added" },
                        ]}
                    />

                    <SettingsSelect
                        id="sort-order"
                        label="Sort Order"
                        description="Ascending or descending"
                        value={settings.sortOrder}
                        onValueChange={(v) => updateSetting("sortOrder", v as typeof settings.sortOrder)}
                        options={[
                            { value: "asc", label: "Ascending (A-Z)" },
                            { value: "desc", label: "Descending (Z-A)" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function ContactsDisplaySettings() {
    const { settings, updateSetting, isLoaded } = useContactsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize contact appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="photos"
                        label="Show Photos"
                        description="Display contact profile photos"
                        checked={settings.showPhotos}
                        onCheckedChange={(v) => updateSetting("showPhotos", v)}
                    />

                    <SettingsToggle
                        id="company"
                        label="Show Company"
                        description="Display company information"
                        checked={settings.showCompany}
                        onCheckedChange={(v) => updateSetting("showCompany", v)}
                    />

                    <SettingsToggle
                        id="tags"
                        label="Show Tags"
                        description="Display contact tags"
                        checked={settings.showTags}
                        onCheckedChange={(v) => updateSetting("showTags", v)}
                    />

                    <SettingsToggle
                        id="last-contact"
                        label="Show Last Contact"
                        description="Display when you last contacted"
                        checked={settings.showLastContact}
                        onCheckedChange={(v) => updateSetting("showLastContact", v)}
                    />

                    <Separator />

                    <SettingsSelect
                        id="card-size"
                        label="Card Size"
                        description="Contact card dimensions"
                        value={settings.cardSize}
                        onValueChange={(v) => updateSetting("cardSize", v as typeof settings.cardSize)}
                        options={[
                            { value: "compact", label: "Compact" },
                            { value: "normal", label: "Normal" },
                            { value: "large", label: "Large" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function ContactsImportExportSettings() {
    const { settings, updateSetting, isLoaded } = useContactsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Import & Export</CardTitle>
                    <CardDescription>Configure import and export settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="export-format"
                        label="Default Export Format"
                        description="Preferred format for exports"
                        value={settings.defaultExportFormat}
                        onValueChange={(v) => updateSetting("defaultExportFormat", v as typeof settings.defaultExportFormat)}
                        options={[
                            { value: "csv", label: "CSV" },
                            { value: "vcf", label: "vCard (VCF)" },
                            { value: "xlsx", label: "Excel (XLSX)" },
                        ]}
                    />

                    <SettingsSelect
                        id="duplicates"
                        label="Duplicate Handling"
                        description="What to do with duplicate contacts"
                        value={settings.duplicateHandling}
                        onValueChange={(v) => updateSetting("duplicateHandling", v as typeof settings.duplicateHandling)}
                        options={[
                            { value: "skip", label: "Skip duplicates" },
                            { value: "merge", label: "Merge with existing" },
                            { value: "create", label: "Create new entry" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function ContactsPrivacySettings() {
    const { settings, updateSetting, isLoaded } = useContactsSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>Configure privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="confirm-delete"
                        label="Confirm Before Delete"
                        description="Require confirmation when deleting contacts"
                        checked={settings.requireConfirmDelete}
                        onCheckedChange={(v) => updateSetting("requireConfirmDelete", v)}
                    />

                    <SettingsToggle
                        id="private"
                        label="Show Private Contacts"
                        description="Display contacts marked as private"
                        checked={settings.showPrivateContacts}
                        onCheckedChange={(v) => updateSetting("showPrivateContacts", v)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const ContactsSettings = ContactsGeneralSettings
