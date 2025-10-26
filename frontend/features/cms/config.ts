/**
 * CMS Feature Configuration
 *
 * This is the single source of truth for the CMS feature.
 * All metadata, routes, permissions, etc. are defined here.
 */

import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  // ============================================================================
  // IDENTITY
  // ============================================================================
  id: 'cms',
  name: 'CMS Builder',
  description: 'Build and manage your content management system with visual builder',

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================
  ui: {
    icon: 'Layout',
    path: '/dashboard/cms',
    component: 'CMSBuilderPage',
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
      id: 'cms-preview',
      name: 'Live Preview',
      description: 'Preview your built interfaces in real-time',
      ui: {
        icon: 'Eye',
        path: '/dashboard/cms/preview',
        component: 'CMSPreviewPage',
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
