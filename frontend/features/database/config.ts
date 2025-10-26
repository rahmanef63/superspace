import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'databases',
  name: 'Databases',
  description: 'Notion-style database views and management',

  ui: {
    icon: 'Database',
    path: '/dashboard/databases',
    component: 'DatabasesPage',
    category: 'productivity',
    order: 7,
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
