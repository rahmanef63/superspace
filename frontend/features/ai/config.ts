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
    recommended: [],
    optional: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'personal-productivity', 'content-creator', 'digital-agency',
      'education',
    ],
  },

  tags: ['ai', 'assistant', 'automation'],
})
