import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'workspace-settings',
  name: 'Settings',
  description: 'Workspace configuration and settings',

  ui: {
    icon: 'Settings',
    path: '/dashboard/settings',
    component: 'WorkspacesPage',
    category: 'administration',
    order: 99,
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

  permissions: ['MANAGE_WORKSPACE'],
})
