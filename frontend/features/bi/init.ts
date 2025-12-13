/**
 * BI Feature Initialization
 * Registers BI settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { LineChart } from "lucide-react"
import { BiSettings } from "./settings"
import { registerBiAgent } from "./agents"

registerFeatureSettings("bi", () => [
  {
    id: "bi-general",
    label: "Business Intelligence",
    icon: LineChart,
    order: 100,
    component: BiSettings,
  },
])

registerBiAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ BI feature settings registered")
}
