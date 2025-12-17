/**
 * Workspace Store Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Store, Settings } from "lucide-react"
import { WorkspaceStoreSettings } from "./settings"
import { registerWorkspaceStoreAgent } from "./agents"

registerFeatureSettings("workspace-store", () => [
  {
    id: "workspace-store-general",
    label: "Workspace Store",
    icon: Settings,
    order: 500,
    component: WorkspaceStoreSettings,
  },
])

registerWorkspaceStoreAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
