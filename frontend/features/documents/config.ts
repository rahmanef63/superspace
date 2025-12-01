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

  // Bundle membership
  bundles: {
    core: [],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'knowledge-base', 'personal-minimal', 'personal-productivity',
      'family', 'content-creator', 'digital-agency', 'education',
    ],
    optional: ['sales-crm', 'community'],
  },

  tags: ['collaboration', 'real-time', 'documents', 'editor'],
})
