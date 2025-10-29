import type { FeatureTab } from '@/frontend/shared/foundation/registry/CrossFeatureRegistry';

export const registerAutomationLibraryTabs = (registerFeatureTabs: (feature: string, tabs: FeatureTab[]) => void) => {
  const automationLibraryTabs: FeatureTab[] = [
    {
      id: 'triggers',
      label: 'Triggers',
      feature: 'automation',
      categories: ['Webhook', 'HTTP'],
    },
    {
      id: 'actions',
      label: 'Actions',
      feature: 'automation',
      categories: ['Integration', 'Data'],
    },
    {
      id: 'logic',
      label: 'Logic',
      feature: 'automation',
      categories: ['Logic'],
    },
    {
      id: 'ai',
      label: 'AI & LLM',
      feature: 'automation',
      categories: ['AI', 'LLM'],
    }
  ];

  registerFeatureTabs('automation', automationLibraryTabs);
};
