/**
 * Accounting Feature Initialization
 * Registers accounting settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Calculator } from "lucide-react"
import { AccountingSettings } from "./settings"
import { registerAccountingAgent } from "./agents"

registerFeatureSettings("accounting", () => [
  {
    id: "accounting-general",
    label: "Accounting",
    icon: Calculator,
    order: 100,
    component: AccountingSettings,
  },
])

registerAccountingAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
