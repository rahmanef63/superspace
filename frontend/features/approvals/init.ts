/**
 * Approvals Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { CheckCircle, Settings } from "lucide-react"
import { ApprovalsSettings } from "./settings"
import { registerApprovalsAgent } from "./agents"

registerFeatureSettings("approvals", () => [
  {
    id: "approvals-general",
    label: "Approvals",
    icon: Settings,
    order: 500,
    component: ApprovalsSettings,
  },
])

registerApprovalsAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Approvals feature settings & agent registered", { icon: CheckCircle })
}
