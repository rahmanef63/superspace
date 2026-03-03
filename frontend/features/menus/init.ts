/**
 * Menus (Menu Store) Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Menu, Settings } from "lucide-react"
import { MenuStoreSettings } from "./settings"
import { registerMenusAgent } from "./agents"

registerFeatureSettings("menus", () => [
  {
    id: "menus-general",
    label: "Menus",
    icon: Settings,
    order: 500,
    component: MenuStoreSettings,
  },
])

registerMenusAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
