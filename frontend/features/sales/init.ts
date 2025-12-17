/**
 * Sales Feature Initialization
 * Registers sales settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { DollarSign } from "lucide-react"
import { SalesSettings } from "./settings"
import { registerSalesAgent } from "./agents"

registerFeatureSettings("sales", () => [
  {
    id: "sales-general",
    label: "Sales",
    icon: DollarSign,
    order: 100,
    component: SalesSettings,
  },
])

registerSalesAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
