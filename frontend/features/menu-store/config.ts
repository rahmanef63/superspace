import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'menus',
  name: 'Menu Store',
  description: 'Install and manage navigation menus',

  ui: {
    icon: 'Menu',
    path: '/dashboard/menus',
    component: 'MenusPage',
    category: 'administration',
    order: 10,
  },

  technical: {
    featureType: 'system',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  permissions: ['MANAGE_MENUS'],
})
