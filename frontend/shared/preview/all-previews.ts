/**
 * Feature Preview Registry
 * 
 * Central registry that imports and exports all feature previews
 * This file is used by the workspace-store and menu-store to display previews
 */

// Import all feature previews
import OverviewPreview from '@/frontend/features/overview/features-preview/index'
import ChatPreview from '@/frontend/features/chat/features-preview/index'
import KnowledgePreview from '@/frontend/features/knowledge/features-preview/index'
import MembersPreview from '@/frontend/features/members/features-preview/index'
import AIPreview from '@/frontend/features/ai/features-preview/index'
import DocumentsPreview from '@/frontend/features/documents/features-preview/index'
import StarredPreview from '@/frontend/features/starred/features-preview/index'
import DatabasePreview from '@/frontend/features/database/features-preview/index'
import FriendsPreview from '@/frontend/features/friends/features-preview/index'
import ArchivedPreview from '@/frontend/features/archived/features-preview/index'
import AnalyticsPreview from '@/frontend/features/analytics/features-preview/index'
import InvitationsPreview from '@/frontend/features/invitations/features-preview/index'
import NotificationsPreview from '@/frontend/features/notifications/features-preview/index'
import CMSLitePreview from '@/frontend/features/cms-lite/features-preview/index'
import TasksPreview from '@/frontend/features/tasks/features-preview/index'
import WorkspaceSettingsPreview from '@/frontend/features/workspace-settings/features-preview/index'
import UserSettingsPreview from '@/frontend/features/user-settings/features-preview/index'
import ProjectsPreview from '@/frontend/features/projects/features-preview/index'

import { registerFeaturePreview, getFeaturePreview, getAllFeaturePreviews } from './registry'
import type { FeaturePreviewDefinition } from './types'

// Auto-register all previews
const allPreviews: FeaturePreviewDefinition[] = [
  OverviewPreview,
  ChatPreview,
  KnowledgePreview,
  MembersPreview,
  AIPreview,
  DocumentsPreview,
  StarredPreview,
  DatabasePreview,
  FriendsPreview,
  ArchivedPreview,
  AnalyticsPreview,
  InvitationsPreview,
  NotificationsPreview,
  CMSLitePreview,
  TasksPreview,
  WorkspaceSettingsPreview,
  UserSettingsPreview,
  ProjectsPreview,
]

// Register all previews
allPreviews.forEach(preview => registerFeaturePreview(preview))

// Export registry functions
export { getFeaturePreview, getAllFeaturePreviews }

// Export individual previews for direct imports
export {
  OverviewPreview,
  ChatPreview,
  KnowledgePreview,
  MembersPreview,
  AIPreview,
  DocumentsPreview,
  StarredPreview,
  DatabasePreview,
  FriendsPreview,
  ArchivedPreview,
  AnalyticsPreview,
  InvitationsPreview,
  NotificationsPreview,
  CMSLitePreview,
  TasksPreview,
  WorkspaceSettingsPreview,
  UserSettingsPreview,
  ProjectsPreview,
}

// Export preview definitions map for type-safe lookups
export const featurePreviewsMap = Object.fromEntries(
  allPreviews.map(preview => [preview.featureId, preview])
) as Record<string, FeaturePreviewDefinition>
