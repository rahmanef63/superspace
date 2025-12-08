/**
 * Calendar Feature Initialization
 * Registers calendar settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Calendar, Layout, CalendarDays, RefreshCw } from "lucide-react"
import {
    CalendarGeneralSettings,
    CalendarDisplaySettings,
    CalendarEventSettings,
    CalendarSyncSettings,
} from "./settings"

registerFeatureSettings("calendar", () => [
    {
        id: "calendar-general",
        label: "General",
        icon: Calendar,
        order: 100,
        component: CalendarGeneralSettings,
    },
    {
        id: "calendar-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: CalendarDisplaySettings,
    },
    {
        id: "calendar-events",
        label: "Events",
        icon: CalendarDays,
        order: 120,
        component: CalendarEventSettings,
    },
    {
        id: "calendar-sync",
        label: "Sync",
        icon: RefreshCw,
        order: 130,
        component: CalendarSyncSettings,
    },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("✅ Calendar feature settings registered")
}
