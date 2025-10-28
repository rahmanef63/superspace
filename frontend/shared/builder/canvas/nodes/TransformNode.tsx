import React from 'react';
import { BaseNode } from './BaseNode';
import type { CanvasNode, NodeConfig } from '../core/types';

interface TransformNodeProps {
  id: string;
  data: CanvasNode['data'];
  selected?: boolean;
}

export const TransformNode: React.FC<TransformNodeProps> = (props) => {
  const config: NodeConfig = {
    label: 'Transform',
    category: 'Processing',
    icon: '🔄',
    color: 'purple',
    defaults: {
      operation: 'map',
      expression: 'x => x'
    },
    inputs: [
      { id: 'input', label: 'Input', type: 'any' }
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'any' }
    ],
    render: (props) => (
      <div className="text-xs space-y-1">
        <div className="font-medium">{props.operation}</div>
        <div className="font-mono text-[10px] bg-gray-50 p-1 rounded">
          {props.expression}
        </div>
      </div>
    )
  };

  return <BaseNode {...props} config={config} />;
};
