import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'settings',
  name: 'Settings',
  description: 'Workspace configuration and settings',

  ui: {
    icon: 'Settings',
    path: '/dashboard/settings',
    component: 'WorkspacesPage',
    category: 'administration',
    order: 99,
  },

  technical: {
    featureType: 'system',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  // Bundle membership - CORE for all bundles (essential system feature)
  bundles: {
    core: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'personal-minimal', 'personal-productivity', 'family',
      'content-creator', 'digital-agency',
      'education', 'community',
    ],
    recommended: [],
    optional: [],
  },

  tags: ['workspace', 'settings', 'configuration'],

  permissions: ['MANAGE_WORKSPACE'],
})
