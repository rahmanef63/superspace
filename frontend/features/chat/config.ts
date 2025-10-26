import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'chat',
  name: 'Chat',
  description: 'Chat conversations',

  ui: {
    icon: 'MessageCircle',
    path: '/dashboard/chat',
    component: 'ChatsPage',
    category: 'communication',
    order: 1,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '2.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  hasSettings: true,
  settingsPath: 'features/chat/components/calls/settings',
})
