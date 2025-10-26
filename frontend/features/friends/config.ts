import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'friends',
  name: 'Friends',
  description: 'Manage your friends and connections',

  ui: {
    icon: 'Heart',
    path: '/dashboard/friends',
    component: 'FriendsPage',
    category: 'social',
    order: 5,
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
