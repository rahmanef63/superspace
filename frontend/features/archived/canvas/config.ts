import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'canvas',
  name: 'Canvas',
  description: 'Visual collaboration and whiteboarding',

  ui: {
    icon: 'Palette',
    path: '/dashboard/canvas',
    component: 'CanvasPage',
    category: 'creativity',
    order: 8,
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
