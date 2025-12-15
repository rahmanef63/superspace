import type { FeatureTab } from '@/frontend/shared/foundation';

export const registerAutomationLibraryTabs = (registerFeatureTabs: (feature: string, tabs: FeatureTab[]) => void) => {
  const automationLibraryTabs: FeatureTab[] = [
    {
      id: 'triggers',
      label: 'Triggers',
      feature: 'automation',
      categories: ['Trigger'],
    },
    {
      id: 'http',
      label: 'HTTP',
      feature: 'automation',
      categories: ['HTTP'],
    },
    {
      id: 'data',
      label: 'Data',
      feature: 'automation',
      categories: ['Data'],
    },
    {
      id: 'logic',
      label: 'Flow',
      feature: 'automation',
      categories: ['Logic'],
    },
    {
      id: 'integrations',
      label: 'Apps',
      feature: 'automation',
      categories: ['Integration'],
    },
    {
      id: 'ai',
      label: 'AI',
      feature: 'automation',
      categories: ['AI', 'LLM'],
    },
    {
      id: 'error',
      label: 'Error',
      feature: 'automation',
      categories: ['Error'],
    }
  ];

  registerFeatureTabs('automation', automationLibraryTabs);
};

