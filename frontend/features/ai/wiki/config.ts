import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'ai-wiki',
  name: 'AI Knowledge Base',
  description: 'AI-powered knowledge management and documentation for intelligent context',

  ui: {
    icon: 'BookOpen',
    path: '/dashboard/ai/wiki',
    component: 'WikiPage',
    category: 'ai',
    order: 2,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'beta',
    isReady: true,
    expectedRelease: 'Q1 2025',
  },

  tags: ['ai', 'knowledge-base', 'documentation', 'rag'],
})
