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

  permissions: ['MANAGE_MEMBERS'],
})
