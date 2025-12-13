/**
 * Integrations Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Plug, Settings } from "lucide-react"
import { IntegrationsSettings } from "./settings"
import { registerIntegrationsAgent } from "./agents"

registerFeatureSettings("integrations", () => [
  {
    id: "integrations-general",
    label: "Integrations",
    icon: Settings,
    order: 500,
    component: IntegrationsSettings,
  },
])

registerIntegrationsAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Integrations feature settings & agent registered", { icon: Plug })
}
