/**
 * Contacts Feature Initialization
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Users, Layout, Download, Shield } from "lucide-react"
import {
    ContactsGeneralSettings,
    ContactsDisplaySettings,
    ContactsImportExportSettings,
    ContactsPrivacySettings,
} from "./settings"

registerFeatureSettings("contacts", () => [
    {
        id: "contacts-general",
        label: "General",
        icon: Users,
        order: 100,
        component: ContactsGeneralSettings,
    },
    {
        id: "contacts-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: ContactsDisplaySettings,
    },
    {
        id: "contacts-import-export",
        label: "Import/Export",
        icon: Download,
        order: 120,
        component: ContactsImportExportSettings,
    },
    {
        id: "contacts-privacy",
        label: "Privacy",
        icon: Shield,
        order: 130,
        component: ContactsPrivacySettings,
    },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("✅ Contacts feature settings registered")
}
