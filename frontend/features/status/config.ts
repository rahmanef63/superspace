import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'status',
  name: 'Status',
  description: 'Status updates',

  ui: {
    icon: 'Camera',
    path: '/dashboard/status',
    component: 'StatusPage',
    category: 'communication',
    order: 3,
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
})
