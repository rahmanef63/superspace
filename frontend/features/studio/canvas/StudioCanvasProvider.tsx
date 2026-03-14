/**
 * StudioCanvasProvider
 *
 * Studio-specific canvas provider — thin wrapper around SharedCanvasProvider.
 * Injects studio's widget config and initial schema so the shared provider
 * has no direct dependency on the studio feature.
 *
 * Usage (in studio pages/layouts only):
 *   <StudioCanvasProvider>
 *     <SharedCanvas ... />
 *   </StudioCanvasProvider>
 *
 * @see frontend/shared/builder/canvas/core/SharedCanvasProvider.tsx
 */

"use client";

import React from 'react';
import { SharedCanvasProvider } from '@/frontend/shared/builder/canvas/core/SharedCanvasProvider';
import { getWidgetConfig } from '@/frontend/features/studio/ui/registry';
import { INITIAL_CMS_SCHEMA } from '@/frontend/features/studio/mockdata';

interface StudioCanvasProviderProps {
  children: React.ReactNode;
  initialMode?: 'cms' | 'automation' | 'database' | 'studio';
}

/**
 * Wraps SharedCanvasProvider with studio-specific configuration:
 * - widgetConfigGetter: studio widget registry lookup
 * - initialSchema: default canvas schema with sample content
 */
export const StudioCanvasProvider: React.FC<StudioCanvasProviderProps> = ({
  children,
  initialMode = 'studio',
}) => {
  return (
    <SharedCanvasProvider
      initialMode={initialMode}
      widgetConfigGetter={getWidgetConfig}
      initialSchema={INITIAL_CMS_SCHEMA}
    >
      {children}
    </SharedCanvasProvider>
  );
};
