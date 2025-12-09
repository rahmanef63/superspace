// NOTE: Settings are registered via init.ts at app runtime, not exported here
// to avoid Node.js compatibility issues in sync scripts

export const WA_THEMES = {
  light: {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    muted: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  },
  dark: {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    muted: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  },
} as const
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

  // Bundle membership
  bundles: {
    core: [],
    recommended: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'personal-minimal', 'personal-productivity', 'family',
      'content-creator', 'digital-agency',
      'education', 'community',
    ],
    optional: [],
  },

  hasSettings: true,
  settingsPath: 'features/chat/components/calls/settings',
})