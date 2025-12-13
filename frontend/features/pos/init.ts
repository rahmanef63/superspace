/**
 * POS Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { ShoppingCart, Settings } from "lucide-react"
import { PosSettings } from "./settings"
import { registerPosAgent } from "./agents"

registerFeatureSettings("pos", () => [
  {
    id: "pos-general",
    label: "Point of Sale",
    icon: Settings,
    order: 500,
    component: PosSettings,
  },
])

registerPosAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ POS feature settings & agent registered", { icon: ShoppingCart })
}
