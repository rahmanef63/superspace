import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'notifications',
  name: 'Notifications',
  description: 'System notifications and activity feed',

  ui: {
    icon: 'Bell',
    path: '/dashboard/notifications',
    component: 'NotificationsPage',
    category: 'communication',
    order: 18,
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

  tags: ['notifications', 'activity', 'feed'],
})
