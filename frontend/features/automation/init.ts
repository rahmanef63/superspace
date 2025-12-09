/**
 * Automation Feature Initialization
 */

import { registerFeatureSettings } from "@/frontend/shared/settings/featureSettingsRegistry"
import { Zap, Play, Bell, FileText } from "lucide-react"
import {
    AutomationGeneralSettings,
    AutomationExecutionSettings,
    AutomationNotificationSettings,
    AutomationLoggingSettings,
} from "./settings"

registerFeatureSettings("automation", () => [
    {
        id: "automation-general",
        label: "General",
        icon: Zap,
        order: 100,
        component: AutomationGeneralSettings,
    },
    {
        id: "automation-execution",
        label: "Execution",
        icon: Play,
        order: 110,
        component: AutomationExecutionSettings,
    },
    {
        id: "automation-notifications",
        label: "Notifications",
        icon: Bell,
        order: 120,
        component: AutomationNotificationSettings,
    },
    {
        id: "automation-logging",
        label: "Logging",
        icon: FileText,
        order: 130,
        component: AutomationLoggingSettings,
    },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("✅ Automation feature settings registered")
}
