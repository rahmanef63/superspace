/**
 * Documents Feature Initialization
 * Registers documents settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { FileText, Share2, Users, Download } from "lucide-react"
import {
  DocumentsEditorSettings,
  DocumentsSharingSettings,
  DocumentsCollaborationSettings,
  DocumentsExportSettings,
} from "./settings"

registerFeatureSettings("documents", () => [
  {
    id: "documents-editor",
    label: "Editor",
    icon: FileText,
    order: 100,
    component: DocumentsEditorSettings,
  },
  {
    id: "documents-sharing",
    label: "Sharing",
    icon: Share2,
    order: 110,
    component: DocumentsSharingSettings,
  },
  {
    id: "documents-collaboration",
    label: "Collaboration",
    icon: Users,
    order: 120,
    component: DocumentsCollaborationSettings,
  },
  {
    id: "documents-export",
    label: "Export",
    icon: Download,
    order: 130,
    component: DocumentsExportSettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Documents feature settings registered")
}
