/**
 * ERP CRM Module Configuration
 */

import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

export default defineFeature({
  id: 'crm',
  name: 'CRM',
  description: 'Customer Relationship Management with contacts, leads, opportunities, and sales pipeline',

  ui: {
    icon: 'Users',
    path: '/dashboard/erp/crm',
    component: 'CrmPage',
    category: 'administration',
    order: 120,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  dependencies: [],

  status: {
    state: 'stable',
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: ["business-pro", "sales-crm", "digital-agency"],
    optional: ["startup"],
  },

  permissions: [
    'erp.crm.view',
    'erp.crm.create',
    'erp.crm.edit',
    'erp.crm.delete',
    'erp.crm.export',
  ],

  tags: ["erp", "crm", "customers", "leads", "sales"],
})
