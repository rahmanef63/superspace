import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'wiki',
  name: 'Wiki',
  description: 'Knowledge base and documentation',

  ui: {
    icon: 'Book',
    path: '/dashboard/wiki',
    component: 'WikiPage',
    category: 'productivity',
    order: 14,
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
    expectedRelease: 'Q2 2025',
  },

  tags: ['documentation', 'knowledge-base'],
})
