import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'tasks',
  name: 'Tasks',
  description: 'Task management and tracking',

  ui: {
    icon: 'CheckSquare',
    path: '/dashboard/tasks',
    component: 'TasksPage',
    category: 'productivity',
    order: 13,
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

  agent: {
    definitionPath: "convex/features/tasks/agent.ts",
    capabilities: ["create", "read", "update", "delete", "search"],
  },

  // Bundle membership
  bundles: {
    core: [],
    recommended: [
      'startup', 'business-pro', 'project-management',
      'personal-productivity', 'digital-agency', 'education',
    ],
    optional: [
      'sales-crm', 'knowledge-base', 'personal-minimal',
      'family', 'content-creator', 'community',
    ],
  },

  tags: ['productivity', 'project-management'],

  // Export/Import integration
  hasExportImport: true,
  exportConfigPath: 'features/tasks/data/export-config',
})
