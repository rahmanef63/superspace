/**
 * Calls Feature Initialization
 * Registers calls settings with the shared settings registry
 *
 * Import this file at app initialization to enable calls settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings/featureSettingsRegistry"
import { Phone, Mic, PhoneCall, Circle } from "lucide-react"
import {
  CallsQualitySettings,
  CallsDeviceSettings,
  CallsBehaviorSettings,
  CallsRecordingSettings,
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
  {
    id: "calls-behavior",
    label: "Behavior",
    icon: PhoneCall,
    order: 220,
    component: CallsBehaviorSettings,
  },
  {
    id: "calls-recording",
    label: "Recording",
    icon: Circle,
    order: 230,
    component: CallsRecordingSettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Calls feature settings registered")
}
