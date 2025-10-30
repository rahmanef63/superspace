import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/frontend/shared/foundation';
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { Globe2, Webhook, Puzzle, Binary, Table2, Zap } from 'lucide-react';

interface AutomationNodeProps {
  id: string;
  data: {
    type: string;
    props: Record<string, any>;
    feature: string;
    category: string;
  };
  selected?: boolean;
}

const getIconByCategory = (category: string) => {
  switch (category) {
    case 'HTTP':
      return Globe2;
    case 'Webhook':
      return Webhook;
    case 'Integration':
      return Puzzle;
    case 'Logic':
      return Binary;
    case 'Data':
      return Table2;
    default:
      return Zap;
  }
};

export const AutomationNode: React.FC<AutomationNodeProps> = ({ id, data, selected }) => {
  const { getComponent } = useCrossFeatureRegistry();
  const config = getComponent(data.type);
  const Icon = getIconByCategory(data.category);

  return (
    <div className={cn('min-w-[220px] rounded-2xl border shadow-sm', 'bg-white', selected ? 'border-black ring-2 ring-black/20' : 'border-gray-200')}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon size={14} />
          <span className="text-xs font-medium">{config?.label || data.type}</span>
        </div>
        <span className="text-[10px] text-gray-500">{id.slice(-4)}</span>
      </div>
      <div className="p-3 text-[11px] text-gray-600">
        <div className="truncate">{data.feature === 'cms' ? 'CMS' : 'Auto'} • {data.category}</div>
        {data.props.url && <div className="truncate mt-1 text-blue-600">{data.props.url}</div>}
      </div>
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
