import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'invitations',
  name: 'Invitations',
  description: 'Manage workspace invitations',

  ui: {
    icon: 'Mail',
    path: '/dashboard/invitations',
    component: 'InvitationsPage',
    category: 'administration',
    order: 11,
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

  // Bundle membership - SYSTEM feature, core for team workspaces
  bundles: {
    core: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'family', 'digital-agency', 'education', 'community',
    ],
    recommended: [],
    optional: [],
  },

  tags: ['invitations', 'team', 'onboarding'],

  permissions: ['MANAGE_INVITATIONS'],
})
