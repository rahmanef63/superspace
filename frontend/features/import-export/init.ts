/**
 * Import/Export Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { ArrowLeftRight, Settings } from "lucide-react"
import { ImportExportSettings } from "./settings"
import { registerImportExportAgent } from "./agents"

registerFeatureSettings("import-export", () => [
  {
    id: "import-export-general",
    label: "Import / Export",
    icon: Settings,
    order: 500,
    component: ImportExportSettings,
  },
])

registerImportExportAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Import/Export feature settings & agent registered", { icon: ArrowLeftRight })
}
