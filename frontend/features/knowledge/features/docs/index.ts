/**
 * Knowledge > Docs Sub-Feature
 * 
 * This sub-feature wraps and re-exports the documents feature functionality
 * within the knowledge base context. All document functionality is reused
 * from the original documents feature to follow DRY principles.
 * 
 * The documents feature will be deprecated and removed in favor of this
 * sub-feature under the knowledge umbrella.
 */

// Re-export all from documents feature
export * from "@/frontend/features/documents/shared";
export * from "@/frontend/features/documents/api";

// Re-export components
export {
  CreateDocumentDialog,
  DocumentsListView,
  DocumentsListCompact,
  DocumentDetailView,
  DocumentEditorOnly,
  DocumentsView,
  DocumentsThreeColumnLayout,
  DocumentsBreadcrumbs,
  DocumentsTree,
  DocumentPresenceIndicator,
} from "@/frontend/features/documents/shared/components";

// Re-export settings
export {
  DocumentsEditorSettings,
  DocumentsSharingSettings,
  DocumentsCollaborationSettings,
  DocumentsExportSettings,
  DocumentsGeneralSettings,
  useDocumentsSettingsStorage,
} from "@/frontend/features/documents/settings";
