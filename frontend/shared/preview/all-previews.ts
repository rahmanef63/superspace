/**
 * Feature Preview Registry
 *
 * Central registry that imports and exports all feature previews
 * This file is used by the workspace-store and menu-store to display previews
 */

// Import all feature previews
import OverviewPreview from '@/frontend/features/overview/features-preview/index'
import KnowledgePreview from '@/frontend/features/knowledge/features-preview/index'
import AIPreview from '@/frontend/features/ai/features-preview/index'
import DocumentsPreview from '@/frontend/features/documents/features-preview/index'
import DatabasePreview from '@/frontend/features/database/features-preview/index'
import ContactsPreview from '@/frontend/features/contacts/features-preview/index'
import AnalyticsPreview from '@/frontend/features/analytics/features-preview/index'
import CMSLitePreview from '@/frontend/features/cms-lite/features-preview/index'
import TasksPreview from '@/frontend/features/tasks/features-preview/index'
import UserSettingsPreview from '@/frontend/shared/settings/user-settings/features-preview/index'
import ProjectsPreview from '@/frontend/features/projects/features-preview/index'
import CRMPreview from '@/frontend/features/crm/features-preview/index'
import CalendarPreview from '@/frontend/features/calendar/features-preview/index'
import UserManagementPreview from '@/frontend/features/user-management/features-preview/index'
import CommunicationsPreview from '@/frontend/features/communications/features-preview/index'
import InventoryPreview from '@/frontend/features/inventory/features-preview/index'
import FormsPreview from '@/frontend/features/forms/features-preview/index'
import SalesPreview from '@/frontend/features/sales/features-preview/index'
import ReportsPreview from '@/frontend/features/reports/features-preview/index'
import SupportPreview from '@/frontend/features/support/features-preview/index'
import StatusPreview from '@/frontend/features/status/features-preview/index'
import AccountingPreview from '@/frontend/features/accounting/features-preview/index'
import ApprovalsPreview from '@/frontend/features/approvals/features-preview/index'
import AuditLogPreview from '@/frontend/features/audit-log/features-preview/index'
import BiPreview from '@/frontend/features/bi/features-preview/index'
import ContentPreview from '@/frontend/features/content/features-preview/index'
import HrPreview from '@/frontend/features/hr/features-preview/index'
import ImportExportPreview from '@/frontend/features/import-export/features-preview/index'
import IntegrationsPreview from '@/frontend/features/integrations/features-preview/index'
import MarketingPreview from '@/frontend/features/marketing/features-preview/index'
import PosPreview from '@/frontend/features/pos/features-preview/index'

import { registerFeaturePreview, getFeaturePreview, getAllFeaturePreviews } from './registry'
import type { FeaturePreviewDefinition } from './types'

// Auto-register all previews
const allPreviews: FeaturePreviewDefinition[] = [
  OverviewPreview,
  KnowledgePreview,
  AIPreview,
  DocumentsPreview,
  DatabasePreview,
  ContactsPreview,
  AnalyticsPreview,
  CMSLitePreview,
  TasksPreview,
  UserSettingsPreview,
  ProjectsPreview,
  CRMPreview,
  CalendarPreview,
  UserManagementPreview,
  CommunicationsPreview,
  InventoryPreview,
  FormsPreview,
  SalesPreview,
  ReportsPreview,
  SupportPreview,
  StatusPreview,
  // Additional feature previews - Phase 2
  AccountingPreview,
  ApprovalsPreview,
  AuditLogPreview,
  BiPreview,
  ContentPreview,
  HrPreview,
  ImportExportPreview,
  IntegrationsPreview,
  MarketingPreview,
  PosPreview,
]

// Register all previews
allPreviews.forEach((preview, index) => {
  if (preview) {
    registerFeaturePreview(preview)
  } else {
    console.warn(`[FeaturePreviewRegistry] Preview at index ${index} is undefined. Check imports in all-previews.ts`)
  }
})

// Export registry functions
export { getFeaturePreview, getAllFeaturePreviews }

// Export individual previews for direct imports
export {
  OverviewPreview,
  KnowledgePreview,
  AIPreview,
  DocumentsPreview,
  DatabasePreview,
  ContactsPreview,
  AnalyticsPreview,
  CMSLitePreview,
  TasksPreview,
  UserSettingsPreview,
  ProjectsPreview,
  CRMPreview,
  CalendarPreview,
  UserManagementPreview,
  CommunicationsPreview,
  InventoryPreview,
  FormsPreview,
  SalesPreview,
  ReportsPreview,
  SupportPreview,
  StatusPreview,
  // Additional feature previews - Phase 2
  AccountingPreview,
  ApprovalsPreview,
  AuditLogPreview,
  BiPreview,
  ContentPreview,
  HrPreview,
  ImportExportPreview,
  IntegrationsPreview,
  MarketingPreview,
  PosPreview,
}

// Export preview definitions map for type-safe lookups
export const featurePreviewsMap = Object.fromEntries(
  allPreviews
    .filter(preview => !!preview)
    .map(preview => [preview.featureId, preview])
) as Record<string, FeaturePreviewDefinition>

