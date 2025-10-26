import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'pages',
  name: 'Pages',
  description: 'Notion-like pages for documentation',

  ui: {
    icon: 'FileText',
    path: '/dashboard/pages',
    component: 'PagesPage',
    category: 'productivity',
    order: 6,
  },

  technical: {
    featureType: 'default',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },
})
