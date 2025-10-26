import type { FeatureManifest } from '../../shared/types/manifest';

const analyticsManifest: FeatureManifest = {
  id: 'analytics',
  name: 'Analytics',
  description: 'Monitor your business performance',
  icon: '',
  path: '/analytics',
  category: 'insights',
  order: 3,
  children: [
    {
      id: 'analytics-dashboard',
      name: 'Dashboard',
      description: 'Overview of key metrics',
      icon: '📈',
      path: '/analytics/dashboard',
      category: 'insights',
      order: 1
    },
    {
      id: 'analytics-reports',
      name: 'Reports',
      description: 'Detailed analytics reports',
      icon: '📋',
      path: '/analytics/reports',
      category: 'insights',
      order: 2
    },
    {
      id: 'analytics-realtime',
      name: 'Real-time',
      description: 'Live data monitoring',
      icon: '⚡',
      path: '/analytics/realtime',
      category: 'insights',
      order: 3
    }
  ]
};

export default analyticsManifest;
