/**
 * Notifications Feature Initialization
 * Registers notifications-related settings with the settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Bell, Moon, Filter, LayoutGrid } from "lucide-react"
import {
  NotificationsGeneralSettings,
  NotificationsQuietHoursSettings,
  NotificationsFilterSettings,
  NotificationsFeatureSettings,
} from "./settings"

// Register notifications feature settings
registerFeatureSettings("notifications", () => [
  {
    id: "notifications-general",
    label: "General",
    icon: Bell,
    order: 100,
    component: NotificationsGeneralSettings,
  },
  {
    id: "notifications-quiet-hours",
    label: "Quiet Hours",
    icon: Moon,
    order: 110,
    component: NotificationsQuietHoursSettings,
  },
  {
    id: "notifications-filters",
    label: "Filters",
    icon: Filter,
    order: 120,
    component: NotificationsFilterSettings,
  },
  {
    id: "notifications-features",
    label: "Features",
    icon: LayoutGrid,
    order: 130,
    component: NotificationsFeatureSettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Notifications feature settings registered")
}
