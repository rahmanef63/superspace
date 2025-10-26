import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'calls',
  name: 'Calls',
  description: 'Voice and video calls',

  ui: {
    icon: 'Phone',
    path: '/dashboard/calls',
    component: 'CallsPage',
    category: 'communication',
    order: 2,
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

  hasSettings: true,
  settingsPath: 'features/chat/components/calls/settings',
})
