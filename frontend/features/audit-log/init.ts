/**
 * Audit Log Feature Initialization
 * Registers audit-log settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { History, Settings } from "lucide-react"
import { AuditLogGeneralSettings } from "./settings"
import { registerAuditLogAgent } from "./agents"

registerFeatureSettings("audit-log", () => [
  {
    id: "audit-log-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AuditLogGeneralSettings,
  },
])

registerAuditLogAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Audit Log feature settings & agent registered", { icon: History })
}
