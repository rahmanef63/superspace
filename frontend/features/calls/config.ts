import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'calls',
  name: 'Calls',
  description: 'Voice and video calls with team members',

  ui: {
    icon: 'Phone',
    path: '/dashboard/calls',
    component: 'CallsPage',
    category: 'communication',
    order: 2,
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

  // Bundle membership
  bundles: {
    core: [],
    recommended: ['business-pro'],
    optional: [
      'startup', 'sales-crm', 'project-management',
      'digital-agency', 'education', 'community',
    ],
  },

  tags: ['communication', 'calls', 'voice', 'video'],

  hasSettings: true,
  settingsPath: 'features/chat/components/calls/settings',
})
