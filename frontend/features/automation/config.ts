/**
 * Automation Feature Configuration
 */

import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'automation',
  name: 'Automation',
  description: 'Automate workflows and processes with visual builders',

  ui: {
    icon: 'Workflow',
    path: '/dashboard/automation',
    component: 'AutomationPage',
    category: 'productivity',
    order: 22,
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

  // Bundle membership
  bundles: {
    core: [],
    recommended: ['personal-productivity'],
    optional: [
      'startup', 'business-pro', 'sales-crm',
      'project-management', 'knowledge-base',
      'content-creator', 'digital-agency',
    ],
  },

  tags: ['automation', 'workflows', 'visual-builder', 'no-code'],

  permissions: [
    'automation.create',
    'automation.update',
    'automation.execute',
  ],

  children: [
    {
      id: 'automation-builder',
      name: 'Workflow Builder',
      description: 'Visual workflow builder',
      ui: {
        icon: 'GitBranch',
        path: '/dashboard/automation/builder',
        component: 'AutomationBuilderPage',
        category: 'productivity',
        order: 1,
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
    },
  ],
})
