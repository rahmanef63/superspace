/**
 * Reports Feature Initialization
 * Registers reports-related settings with the settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { FileBarChart, Calendar, FileText, Palette } from "lucide-react"
import {
  ReportsGeneralSettings,
  ReportsScheduleSettings,
  ReportsContentSettings,
  ReportsDisplaySettings,
} from "./settings"

// Register reports feature settings
registerFeatureSettings("reports", () => [
  {
    id: "reports-general",
    label: "General",
    icon: FileBarChart,
    order: 100,
    component: ReportsGeneralSettings,
  },
  {
    id: "reports-schedule",
    label: "Scheduling",
    icon: Calendar,
    order: 110,
    component: ReportsScheduleSettings,
  },
  {
    id: "reports-content",
    label: "Content",
    icon: FileText,
    order: 120,
    component: ReportsContentSettings,
  },
  {
    id: "reports-display",
    label: "Display",
    icon: Palette,
    order: 130,
    component: ReportsDisplaySettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Reports feature settings registered")
}
