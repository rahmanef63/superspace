import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'starred',
  name: 'Starred',
  description: 'Starred messages',

  ui: {
    icon: 'Star',
    path: '/dashboard/starred',
    component: 'StarredPage',
    category: 'communication',
    order: 5,
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
