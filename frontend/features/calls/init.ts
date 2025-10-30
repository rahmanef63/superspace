/**
 * Calls Feature Initialization
 * Registers calls settings with the shared settings registry
 *
 * Import this file at app initialization to enable calls settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Phone, Mic } from "lucide-react"
import {
  CallsQualitySettings,
  CallsDeviceSettings,
} from "./settings/CallsSettings"

// ============================================================================
// Register Calls Settings
// ============================================================================

registerFeatureSettings("calls", () => [
  {
    id: "calls-quality",
    label: "Call Quality",
    icon: Phone,
    order: 200,
    component: CallsQualitySettings,
  },
  {
    id: "calls-devices",
    label: "Devices",
    icon: Mic,
    order: 210,
    component: CallsDeviceSettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Calls feature settings registered")
}
