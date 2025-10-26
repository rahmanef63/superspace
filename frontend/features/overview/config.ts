import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'overview',
  name: 'Overview',
  description: 'Dashboard overview with analytics and insights',

  ui: {
    icon: 'Home',
    path: '/dashboard/overview',
    component: 'OverviewPage',
    category: 'analytics',
    order: 1,
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
})
