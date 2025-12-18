import type { FeatureTab } from '@/frontend/shared/foundation';

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
      id: 'forms',
      label: 'Forms',
      feature: 'cms',
      categories: ['Form', 'Forms', 'Input'],
    },
    {
      id: 'navigation',
      label: 'Nav',
      feature: 'cms',
      categories: ['Navigation'],
    },
    {
      id: 'action',
      label: 'Actions',
      feature: 'cms',
      categories: ['Action'],
    },
    {
      id: 'ui',
      label: 'UI',
      feature: 'cms',
      categories: ['UI', 'Components'],
    },
    {
      id: 'templates',
      label: 'Templates',
      feature: 'cms',
      categories: ['Templates'],
    },
    {
      id: 'blocks',
      label: 'Blocks',
      feature: 'cms',
      categories: ['Blocks'],
    },
    {
      id: 'all',
      label: 'All',
      feature: 'cms',
      categories: ['Layout', 'Content', 'Media', 'Form', 'Forms', 'Input', 'Navigation', 'Action', 'UI', 'Components', 'Templates', 'Blocks'],
    },
  ];

  registerFeatureTabs('cms', cmsLibraryTabs);
};

