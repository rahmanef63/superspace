import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'status',
  name: 'Status',
  description: 'Share status updates with your team',

  ui: {
    icon: 'Camera',
    path: '/dashboard/status',
    component: 'StatusPage',
    category: 'communication',
    order: 3,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '2.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  tags: ['communication', 'status', 'updates', 'stories'],
})
