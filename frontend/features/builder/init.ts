/**
 * Builder Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Hammer, Settings } from "lucide-react"
import { BuilderSettings } from "./settings"
import { registerBuilderAgent } from "./agents"

registerFeatureSettings("builder", () => [
  {
    id: "builder-general",
    label: "Builder",
    icon: Settings,
    order: 500,
    component: BuilderSettings,
  },
])

registerBuilderAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
