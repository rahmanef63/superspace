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
    state: 'development',
    isReady: false,
    expectedRelease: 'Q2 2025',
  },

  tags: ['productivity', 'project-management'],
})
