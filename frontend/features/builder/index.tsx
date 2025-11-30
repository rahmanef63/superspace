import React from 'react';
import { CMSBuilderPage } from './pages/CMSBuilderPage';

// Initialize dev tools in development
if (process.env.NODE_ENV === 'development') {
  import('./shared/utils/devTools').then(({ CMSDevTools }) => {
    CMSDevTools.printStats();
    CMSDevTools.validate();
  });
}

export const CMSFeature: React.FC = () => {
  return <CMSBuilderPage />;
};

// Export registry for external use
export { cmsWidgetRegistry, widgetStats, widgetCategories } from './widgets/registry';
export * from './shared';

export default CMSFeature;
