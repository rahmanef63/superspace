import React from 'react';
import { InspectorTabs } from '@/frontend/shared/components/inspector/InspectorTabs';
import { useSharedCanvas } from '@/frontend/shared/canvas/core/SharedCanvasProvider';

export const CMSInspectorRenderer: React.FC = () => {
  const { selectedNode } = useSharedCanvas();

  return <InspectorTabs selectedNode={selectedNode} />;
};
