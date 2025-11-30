/**
 * Builder Feature Manifest
 * 
 * Visual node canvas for building:
 * - Content (pages, posts, templates)
 * - Automation workflows
 * - Custom interfaces
 * - CMS-Lite templates
 */

import type { FeatureManifest } from '@/frontend/shared/foundation';

const builderManifest: FeatureManifest = {
  id: 'builder',
  name: 'Builder',
  description: 'Create content, automation, and interfaces with visual node canvas',
  icon: '🔨',
  path: '/builder',
  category: 'creativity',
  order: 20,
  children: [
    {
      id: 'builder-preview',
      name: 'Live Preview',
      description: 'Preview your built interfaces in real-time',
      icon: '👁️',
      path: '/builder/preview',
      category: 'creativity',
      order: 1
    },
    {
      id: 'builder-content',
      name: 'Content Builder',
      description: 'Build content pages and templates',
      icon: '📄',
      path: '/builder/content',
      category: 'creativity',
      order: 2
    },
    {
      id: 'builder-automation',
      name: 'Automation Builder',
      description: 'Build automation workflows',
      icon: '⚡',
      path: '/builder/automation',
      category: 'creativity',
      order: 3
    }
  ]
};

export default builderManifest;