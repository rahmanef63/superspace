import React from 'react';
import type { CMSNode } from '@/frontend/shared/foundation';
import { Select } from '@/components/ui';
import { getWidgetConfig } from '@/frontend/features/cms/shared/registry';

interface NodeSelectorFieldProps {
  value: string;
  onChange: (value: string) => void;
  nodes: CMSNode[];
  filterType?: string;
  placeholder?: string;
}

export const NodeSelectorField: React.FC<NodeSelectorFieldProps> = ({
  value,
  onChange,
  nodes,
  filterType,
  placeholder = "Select a node..."
}) => {
  const filteredNodes = nodes.filter(node => {
    if (!filterType) return true;
    return node.data.comp === filterType;
  });

  const options = filteredNodes.map(node => {
    const config = getWidgetConfig(node.data.comp);
    const label = node.data.props?.label || config?.label || node.data.comp;
    return {
      value: node.id,
      label: `${label} (${node.id.slice(1, 5)})`
    };
  });

  return (
    <Select value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};
