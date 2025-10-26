import React, { useEffect } from 'react';
import { SharedCanvasProvider } from '../../../shared/canvas/core/SharedCanvasProvider';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  Card,
  CardTitle,
} from '../../../shared/components/ui';

import { SharedCanvas } from '../../../shared/components/canvas/SharedCanvas';
import { UnifiedLibrary } from '../../../shared/components/library/UnifiedLibrary';
import { UnifiedInspector } from '../../../shared/components/inspector/UnifiedInspector';
import { AutomationPreview } from '../../../shared/components/preview/AutomationPreview';
import { AutomationNode } from '../components/AutomationNode';

import { useCrossFeatureRegistry } from '../../../shared/registry/CrossFeatureRegistry';
import { registerAutomationComponents } from '../registry/automationComponents';
import { registerAutomationLibraryTabs } from '../registry/automationLibraryTabs';
import { DnDProvider } from '../../../shared/canvas/core/DnDProvider';

const nodeTypes = {
  automationNode: AutomationNode,
};

const AutomationLayout: React.FC = () => {
  return (
    <div className="h-full w-full bg-gray-100 text-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-white/70 px-4 py-2 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">Automation Builder</div>
          <div className="text-[11px] text-gray-500">— Enhanced with Shared Components</div>
        </div>
      </div>

      {/* Main 3-pane layout */}
      <div className="flex-1 p-3 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b"><CardTitle>Library</CardTitle></div>
              <UnifiedLibrary currentFeature="automation" />
            </Card>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60}>
                <Card className="h-full overflow-hidden">
                  <SharedCanvas
                    nodeTypes={nodeTypes}
                    showLayoutControls={true}
                  />
                </Card>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={40}>
                <AutomationPreview />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20} maxSize={35}>
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b"><CardTitle>Inspector</CardTitle></div>
              <UnifiedInspector feature="automation" />
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export const AutomationPage: React.FC = () => {
  const { registerComponent, registerFeatureTabs } = useCrossFeatureRegistry();

  useEffect(() => {
    registerAutomationComponents(registerComponent);
    registerAutomationLibraryTabs(registerFeatureTabs);
  }, [registerComponent, registerFeatureTabs]);

  return (
    <SharedCanvasProvider initialMode="automation">
      <DnDProvider>
        <AutomationLayout />
      </DnDProvider>
    </SharedCanvasProvider>
  );
};
