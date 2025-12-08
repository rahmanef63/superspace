/**
 * ERP Sales Module Configuration
 */

import { defineFeature } from "@/lib/features/defineFeature"

export default defineFeature({
  id: 'sales',
  name: 'Sales & Invoicing',
  description: 'Complete sales management solution with quotes, invoices, recurring billing, payment processing, and sales analytics',

  ui: {
    icon: 'ShoppingCart',
    path: '/dashboard/erp/sales',
    component: 'SalesPage',
    category: 'administration',
    order: 100,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  dependencies: ['notifications'],

  status: {
    state: 'stable',
    isReady: true,
  },

  bundles: {
    core: [],
    recommended: ["business-pro", "sales-crm"],
    optional: ["startup", "digital-agency"],
  },

  permissions: [
    'erp.sales.view',
    'erp.sales.create',
    'erp.sales.edit',
    'erp.sales.delete',
    'erp.sales.approve',
    'erp.sales.export',
  ],

  tags: ["erp", "sales", "invoicing", "payments"],
})
