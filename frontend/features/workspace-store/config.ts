import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'workspace-store',
  name: 'Workspace Store',
  description: 'Manage workspace hierarchy with nested workspaces, drag & drop, and tree visualization',

  ui: {
    icon: 'Building2',
    path: '/dashboard/workspace-store',
    component: 'WorkspaceStorePage',
    category: 'administration',
    order: 5,
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
  // Workspace store is a core system feature always available
  bundles: {
    core: [],
    recommended: [],
    optional: [],
  },

  tags: ['workspace', 'hierarchy', 'tree', 'system', 'administration'],

  permissions: ['MANAGE_WORKSPACES'],
})
