import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'menus',
  name: 'Menu Store',
  description: 'Install and manage navigation menus',

  ui: {
    icon: 'Menu',
    path: '/dashboard/menus',
    component: 'MenuStorePage',
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

  // Bundle membership - SYSTEM feature, not included in bundles
  // Menu store is accessed from workspace settings
  bundles: {
    core: [],
    recommended: [],
    optional: [],
  },

  tags: ['menus', 'navigation', 'system'],

  permissions: ['MANAGE_MENUS'],
})
