import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'tasks',
  name: 'Tasks',
  description: 'Task management and tracking',

  ui: {
    icon: 'CheckSquare',
    path: '/dashboard/tasks',
    component: 'TasksPage',
    category: 'productivity',
    order: 13,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'beta',
    isReady: true,
    expectedRelease: 'Q1 2025',
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'digital-agency', 'education',
    ],
    optional: [
      'sales-crm', 'knowledge-base', 'personal-minimal',
      'family', 'content-creator', 'community',
    ],
  },

  tags: ['productivity', 'project-management'],
})
