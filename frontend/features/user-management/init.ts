/**
 * User Management Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Users, Settings } from "lucide-react"
import { UserManagementSettings } from "./settings"
import { registerUserManagementAgent } from "./agents"

registerFeatureSettings("user-management", () => [
  {
    id: "user-management-general",
    label: "User Management",
    icon: Settings,
    order: 500,
    component: UserManagementSettings,
  },
])

registerUserManagementAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ User Management feature settings & agent registered", { icon: Users })
}
