import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'reports',
  name: 'Reports',
  description: 'Analytics and reporting dashboard',

  ui: {
    icon: 'BarChart',
    path: '/dashboard/reports',
    component: 'ReportsPage',
    category: 'analytics',
    order: 12,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  permissions: ['VIEW_REPORTS'],
})
