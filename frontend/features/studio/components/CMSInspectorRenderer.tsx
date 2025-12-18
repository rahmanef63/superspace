import React from 'react';
import { InspectorTabs } from '@/frontend/shared/builder';
import { useSharedCanvas } from '@/frontend/shared/builder';

export const CMSInspectorRenderer: React.FC = () => {
  const { selectedNode } = useSharedCanvas();

  return <InspectorTabs selectedNode={selectedNode} />;
};
