import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'members',
  name: 'Members',
  description: 'Manage workspace members and permissions',

  ui: {
    icon: 'Users',
    path: '/dashboard/members',
    component: 'MembersPage',
    category: 'administration',
    order: 4,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.1.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  // Bundle membership - CORE for team workspaces
  bundles: {
    core: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'family', 'digital-agency', 'education', 'community',
    ],
    recommended: [],
    optional: [],
  },

  tags: ['members', 'team', 'permissions'],

  permissions: ['MANAGE_MEMBERS'],
})
