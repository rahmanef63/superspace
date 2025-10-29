import React from 'react';
import { InspectorTabs } from '@/frontend/shared/builder/inspector/InspectorTabs';
import { useSharedCanvas } from '@/frontend/shared/builder/canvas/core/SharedCanvasProvider';

export const CMSInspectorRenderer: React.FC = () => {
  const { selectedNode } = useSharedCanvas();

  return <InspectorTabs selectedNode={selectedNode} />;
};
