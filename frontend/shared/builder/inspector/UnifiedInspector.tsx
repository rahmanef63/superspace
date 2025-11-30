import React from 'react';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { useSharedCanvas } from '../canvas/core/SharedCanvasProvider';
import { Input, Label, Select, Switch, Button } from '@/components/ui';
import { ChildrenManager } from './ChildrenManager';
import { DynamicInspector } from './DynamicInspector';

interface UnifiedInspectorProps {
  feature?: 'cms' | 'automation' | 'database';
  customRenderers?: Record<string, React.ComponentType<any>>;
  selectedNode?: any;
}

export const UnifiedInspector: React.FC<UnifiedInspectorProps> = ({
  feature = 'cms',
  customRenderers = {},
  selectedNode: propSelectedNode
}) => {
  const { selectedNode: contextSelectedNode, setNodeProps } = useSharedCanvas();
  const { getComponent, getWidget } = useCrossFeatureRegistry();
  
  // Use prop selectedNode if provided, otherwise use context
  const selectedNode = propSelectedNode || contextSelectedNode;
  
  if (!selectedNode) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a node to edit its properties.
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
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Component</div>
          <div className="text-sm font-semibold flex items-center gap-2">
            {getFeatureIcon(selectedNode.data.feature || feature)}
            {config?.label || nodeType}
          </div>
        </div>
        <CustomRenderer
          selectedNode={selectedNode}
          props={props}
          updateProp={updateProp}
          config={config}
        />
        <ChildrenManager />
      </div>
    );
  }

  // Use the new DynamicInspector for better control handling
  return <DynamicInspector selectedNode={selectedNode} />;
};

function getFeatureIcon(feature: string): string {
  const icons: Record<string, string> = {
    'cms': '📝',
    'automation': '⚡',
    'database': '🗄️'
  };
  return icons[feature] || '📦';
}
