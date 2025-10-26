import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'crm',
  name: 'CRM',
  description: 'Customer relationship management with integrated chat',

  ui: {
    icon: 'Users',
    path: '/dashboard/crm',
    component: 'CRMPage',
    category: 'productivity',
    order: 17,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  tags: ['crm', 'customers', 'sales'],
})
