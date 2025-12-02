import { defineFeature } from '@/lib/features/defineFeature'

/**
 * @deprecated This feature has been moved to frontend/features/knowledge/features/docs
 * The documents feature is now part of the knowledge base umbrella.
 * This config is kept for backward compatibility and will redirect to the knowledge feature.
 */
export default defineFeature({
  id: 'documents',
  name: 'Documents',
  description: 'Collaborative document editor with real-time sync (Deprecated - use Knowledge > Docs)',

  ui: {
    icon: 'FileText',
    path: '/dashboard/documents', // Keep original path for backward compatibility
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
    state: 'deprecated',
    isReady: true,
  },

  // Bundle membership - empty as deprecated
  bundles: {
    core: [],
    recommended: [],
    optional: [],
  },

  tags: ['collaboration', 'real-time', 'documents', 'editor', 'deprecated'],
})
