import React, { useState } from 'react';
import { CMSBuilderPage } from './pages/CMSBuilderPage';
import { BuilderDashboard } from './components/BuilderDashboard';
import { useBuilder } from './hooks/useBuilder';
import { BuilderProject } from './types';

// Initialize dev tools in development
if (process.env.NODE_ENV === 'development') {
  import('./shared/utils/devTools').then(({ CMSDevTools }) => {
    CMSDevTools.printStats();
    CMSDevTools.validate();
  });
}

export const CMSFeature: React.FC = () => {
  const { data, createProject } = useBuilder();
  const [activeProject, setActiveProject] = useState<BuilderProject | null>(null);

  if (activeProject) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="bg-background border-b px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => setActiveProject(null)}
            className="text-sm text-muted-foreground hover:text-foreground underline pb-1"
          >
            ← Back to Projects
          </button>
          <span className="text-sm font-semibold">{activeProject.name}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <CMSBuilderPage />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-6">
      <BuilderDashboard
        data={data}
        onOpenProject={setActiveProject}
        onCreateProject={createProject}
      />
    </div>
  );
};

// Export registry for external use
export { cmsWidgetRegistry, widgetStats, widgetCategories } from './widgets/registry';
export * from './shared';

export default CMSFeature;
