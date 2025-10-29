import type { FeatureManifest } from '@/frontend/shared/foundation/types/manifest';

const automationManifest: FeatureManifest = {
  id: 'automation',
  name: 'Automation',
  description: 'HTTP APIs, webhooks, and third-party integrations',
  icon: '⚡',
  path: '/automation',
  category: 'automation',
  order: 2
};

export default automationManifest;
