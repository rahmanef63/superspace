/**
 * Documents Feature Initialization
 * Registers documents settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings/featureSettingsRegistry"
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

import { registerCreateActions } from "@/frontend/shared/foundation/registries/create-registry"
import { registerCommands } from "@/frontend/shared/foundation/registries/command-registry"

registerCreateActions("documents", [
  {
    id: "create-document",
    label: "Document",
    icon: FileText,
    description: "Create a new collaborative document",
    shortcut: "N D",
    onClick: () => window.dispatchEvent(new Event("open-create-document-dialog")),
    order: 10
  }
])

registerCommands("documents", [
  {
    id: "create-document-cmd",
    label: "Create New Document",
    icon: FileText,
    shortcut: "N D",
    group: "actions",
    keywords: ["new", "doc", "page"],
    action: () => window.dispatchEvent(new Event("open-create-document-dialog"))
  }
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Documents feature settings & actions registered")
}
