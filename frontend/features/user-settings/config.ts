import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'user-settings',
  name: 'Profile',
  description: 'Manage your user profile and preferences',

  ui: {
    icon: 'User',
    path: '/dashboard/user-settings',
    component: 'ProfilePage',
    category: 'administration',
    order: 20,
  },

  technical: {
    featureType: 'default',
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

  tags: ['profile', 'settings', 'user'],
})
