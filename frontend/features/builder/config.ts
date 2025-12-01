/**
 * Builder Feature Configuration
 *
 * This is the single source of truth for the Builder feature.
 * Build apps, content, CMS interfaces, and more with visual tools.
 */

import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  // ============================================================================
  // IDENTITY
  // ============================================================================
  id: 'builder',
  name: 'Builder',
  description: 'Build apps, content, and interfaces with visual builder tools',

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================
  ui: {
    icon: 'Hammer',
    path: '/dashboard/builder',
    component: 'BuilderPage',
    category: 'creativity',
    order: 20,
  },

  // ============================================================================
  // TECHNICAL CONFIGURATION
  // ============================================================================
  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // ============================================================================
  // DEVELOPMENT STATUS
  // ============================================================================
  status: {
    state: 'stable',
    isReady: true,
  },

  // ============================================================================
  // BUNDLE MEMBERSHIP
  // ============================================================================
  bundles: {
    core: [],
    recommended: ['content-creator', 'digital-agency'],
    optional: [
      'startup', 'business-pro', 'personal-productivity',
    ],
  },

  // ============================================================================
  // METADATA
  // ============================================================================
  tags: ['cms', 'content', 'builder', 'visual'],

  // ============================================================================
  // PERMISSIONS
  // ============================================================================
  permissions: [
    'schemas.create',
    'schemas.update',
    'schemas.delete',
    'schemas.manage',
    'documents.create',
    'documents.update',
    'documents.publish',
    'assets.upload',
    'assets.delete',
  ],

  // ============================================================================
  // CHILD ROUTES
  // ============================================================================
  children: [
    {
      id: 'builder-preview',
      name: 'Live Preview',
      description: 'Preview your built interfaces in real-time',
      ui: {
        icon: 'Eye',
        path: '/dashboard/builder/preview',
        component: 'BuilderPreviewPage',
        category: 'creativity',
        order: 1,
      },
      technical: {
        featureType: 'optional',
        hasUI: true,
        hasConvex: false,
        hasTests: false,
        version: '1.0.0',
      },
      status: {
        state: 'stable',
        isReady: true,
      },
    },
  ],
})
