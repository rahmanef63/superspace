import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Cms Lite Feature Configuration
 *
 * This is the single source of truth for the cms-lite feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'cms-lite',
  name: 'Cms Lite',
  description: 'Cms Lite feature',

  // UI Config
  ui: {
    icon: 'Box',                  // Lucide React icon name
    path: '/dashboard/cms-lite',
    component: 'CmsLitePage',
    category: 'productivity',
    order: 100,
  },

  // Technical Config
  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'stable',              // development | beta | stable | deprecated
    isReady: true,                     // Set to true when ready for production
    expectedRelease: undefined,         // Optional: 'Q1 2025'
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: ['content-creator', 'digital-agency'],
    optional: [
      'startup', 'business-pro', 'personal-productivity',
    ],
  },

  // Metadata
  tags: [
    "cms-lite",
    "productivity"
  ],
})
