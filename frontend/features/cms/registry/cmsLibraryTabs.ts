import type { FeatureTab } from '@/frontend/shared/registry/CrossFeatureRegistry';

export const registerCMSLibraryTabs = (registerFeatureTabs: (feature: string, tabs: FeatureTab[]) => void) => {
  const cmsLibraryTabs: FeatureTab[] = [
    {
      id: 'layout',
      label: 'Layout',
      feature: 'cms',
      categories: ['Layout'],
    },
    {
      id: 'content',
      label: 'Content',
      feature: 'cms',
      categories: ['Content'],
    },
    {
      id: 'media',
      label: 'Media',
      feature: 'cms',
      categories: ['Media'],
    },
    {
      id: 'navigation',
      label: 'Navigation',
      feature: 'cms',
      categories: ['Navigation'],
    },
    {
      id: 'action',
      label: 'Action',
      feature: 'cms',
      categories: ['Action'],
    },
    {
      id: 'ui',
      label: 'UI Components',
      feature: 'cms',
      categories: ['UI'],
    },
    {
      id: 'templates',
      label: 'Templates',
      feature: 'cms',
      categories: ['Templates'],
    },
    {
      id: 'all',
      label: 'All Components',
      feature: 'cms',
      categories: ['Layout', 'Content', 'Media', 'Navigation', 'Action', 'UI', 'Templates'],
    },
  ];

  registerFeatureTabs('cms', cmsLibraryTabs);
};
