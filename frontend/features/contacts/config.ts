import { defineFeature } from '@/lib/features/defineFeature'

/**
 * Contacts Feature Configuration
 *
 * Contact and people management across workspace.
 */
export default defineFeature({
  id: 'contacts',
  name: 'Contacts',
  description: 'Contact and people management',

  ui: {
    icon: 'Users',
    path: '/dashboard/contacts',
    component: 'ContactsPage',
    category: 'productivity',
    order: 12,
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
    expectedRelease: 'Q1 2025',
  },

  bundles: {
    core: [],
    recommended: ['sales-crm', 'business-pro'],
    optional: ['startup', 'digital-agency', 'custom'],
  },

  tags: ['contacts', 'people', 'crm'],

  permissions: ['contacts.view', 'contacts.create', 'contacts.update', 'contacts.delete'],
})
