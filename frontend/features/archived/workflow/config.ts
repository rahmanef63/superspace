import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'workflow',
  name: 'Workflow',
  description: 'Workflow automation with bot assistant',

  ui: {
    icon: 'Workflow',
    path: '/dashboard/workflow',
    component: 'WorkflowsPage',
    category: 'productivity',
    order: 19,
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

  tags: ['automation', 'workflows', 'bot'],
})
