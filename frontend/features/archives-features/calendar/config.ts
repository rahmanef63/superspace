import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'calendar',
  name: 'Calendar',
  description: 'Team calendar with event management',

  ui: {
    icon: 'Calendar',
    path: '/dashboard/calendar',
    component: 'CalendarPage',
    category: 'productivity',
    order: 9,
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
    expectedRelease: 'Q1 2025',
  },

  tags: ['scheduling', 'events'],
})
