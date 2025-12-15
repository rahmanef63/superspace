import React from 'react';
import { AutomationPage } from './pages/AutomationPage';
import type { Id } from '@convex/_generated/dataModel';

export const AutomationFeature: React.FC<{ workspaceId?: Id<"workspaces"> }> = ({ workspaceId }) => {
  // Use provided workspaceId or a placeholder for demo
  const wsId = workspaceId as Id<"workspaces">;
  return <AutomationPage workspaceId={wsId} />;
};

export default AutomationFeature;
