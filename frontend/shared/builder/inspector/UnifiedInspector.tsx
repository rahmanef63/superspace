import React from 'react';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { useSharedCanvas } from '../canvas/core/SharedCanvasProvider';
import { Input, Label, Select, Switch, Button } from '@/components/ui';
import { DynamicInspector } from './DynamicInspector';

interface UnifiedInspectorProps {
  feature?: 'cms' | 'automation' | 'database' | 'studio';
  customRenderers?: Record<string, React.ComponentType<any>>;
  selectedNode?: any;
  /** Optional widget-specific fields getter injected by the host feature (e.g. Studio). */
  getWidgetFields?: (comp: string) => import('./DynamicInspector').InspectorField[] | undefined;
}

export const UnifiedInspector: React.FC<UnifiedInspectorProps> = ({
  feature = 'cms',
  customRenderers = {},
  selectedNode: propSelectedNode,
  getWidgetFields,
}) => {
  const { selectedNode: contextSelectedNode, setNodeProps } = useSharedCanvas();
  const { getComponent, getWidget } = useCrossFeatureRegistry();

  // Use prop selectedNode if provided, otherwise use context
  const selectedNode = propSelectedNode || contextSelectedNode;

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
        </div>
        <p className="text-sm font-medium text-foreground">No Selection</p>
        <p className="text-xs text-muted-foreground mt-1">Click on a node in the canvas to edit its properties</p>
      </div>
    );
  }

  const nodeType = selectedNode.data.comp || selectedNode.data.type;
  const config = getComponent(nodeType) || getWidget(nodeType);
  const props = selectedNode.data.props || {};

  const updateProp = (key: string, value: any) => {
    setNodeProps(selectedNode.id, { ...props, [key]: value });
  };

  // Check for custom renderer
  const CustomRenderer = customRenderers[nodeType];
  if (CustomRenderer) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <CustomRenderer
          selectedNode={selectedNode}
          props={props}
          updateProp={updateProp}
          config={config}
        />
      </div>
    );
  }

  // Use the new DynamicInspector for better control handling
  return <DynamicInspector selectedNode={selectedNode} getWidgetFields={getWidgetFields} />;
};

function getFeatureIcon(feature: string): string {
  const icons: Record<string, string> = {
    'cms': '📝',
    'automation': '⚡',
    'database': '🗄️'
  };
  return icons[feature] || '📦';
}
