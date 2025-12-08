import { defineFeature } from '@/lib/features/defineFeature'

/**
 * Integrations Feature Configuration
 *
 * Third-party integrations management.
 */
export default defineFeature({
  id: 'integrations',
  name: 'Integrations',
  description: 'Connect with third-party services and APIs',

  ui: {
    icon: 'Plug',
    path: '/dashboard/integrations',
    component: 'IntegrationsPage',
    category: 'administration',
    order: 18,
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
    expectedRelease: 'Q2 2025',
  },

  bundles: {
    core: [],
    recommended: ['custom', 'business-pro'],
    optional: ['startup', 'sales-crm', 'digital-agency', 'project-management'],
  },

  tags: ['integrations', 'api', 'webhooks', 'oauth'],

  permissions: ['integrations.view', 'integrations.manage', 'integrations.delete'],
})
