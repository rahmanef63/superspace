import { defineFeature } from '@/lib/features/defineFeature'

/**
 * POS (Point of Sale) Feature Configuration
 *
 * Point of sale and retail management.
 */
export default defineFeature({
  id: 'pos',
  name: 'POS',
  description: 'Point of Sale and retail management',

  ui: {
    icon: 'ShoppingCart',
    path: '/dashboard/pos',
    component: 'PosPage',
    category: 'productivity',
    order: 20,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'development',
    isReady: false,
    expectedRelease: 'Q3 2025',
  },

  bundles: {
    core: [],
    recommended: ['business-pro'],
    optional: ['startup'],
  },

  tags: ['pos', 'retail', 'sales', 'cashier'],

  permissions: ['pos.view', 'pos.sell', 'pos.manage', 'pos.reports'],
})
