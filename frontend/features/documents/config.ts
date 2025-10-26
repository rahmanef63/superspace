import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'documents',
  name: 'Documents',
  description: 'Collaborative document editor with real-time sync',

  ui: {
    icon: 'FileText',
    path: '/dashboard/documents',
    component: 'DocumentsPage',
    category: 'productivity',
    order: 9,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.2.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  tags: ['collaboration', 'real-time'],
})
