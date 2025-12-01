import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'archived',
  name: 'Archived',
  description: 'Archived chats',

  ui: {
    icon: 'Archive',
    path: '/dashboard/archived',
    component: 'ArchivedPage',
    category: 'communication',
    order: 6,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '2.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: ['knowledge-base'],
    optional: [
      'startup', 'business-pro', 'project-management',
      'personal-minimal', 'personal-productivity', 'family',
      'content-creator', 'digital-agency', 'education', 'community',
    ],
  },

  tags: ['archive', 'history', 'storage'],
})
