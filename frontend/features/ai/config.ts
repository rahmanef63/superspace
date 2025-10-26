import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'ai',
  name: 'AI',
  description: 'AI assistant',

  ui: {
    icon: 'Bot',
    path: '/dashboard/ai',
    component: 'AIPage',
    category: 'communication',
    order: 4,
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
