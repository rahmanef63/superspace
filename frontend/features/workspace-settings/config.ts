import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'settings',
  name: 'Settings',
  description: 'Personal preferences, account settings, and app configuration',

  ui: {
    icon: 'Settings',
    path: '/dashboard/settings',
    component: 'SettingsPage',
    category: 'administration',
    order: 99,
  },

  technical: {
    featureType: 'system',
    hasUI: true,
    hasConvex: false, // Personal settings use localStorage, no Convex needed
    hasTests: true,
    version: '2.0.0', // Major version bump for simplified architecture
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

  tags: ['personal', 'settings', 'preferences', 'account'],

  // No permissions needed - personal settings are user-scoped
  permissions: [],
})
