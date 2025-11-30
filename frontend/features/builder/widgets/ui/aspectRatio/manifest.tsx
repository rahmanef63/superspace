import type { WidgetConfig, InspectorField } from '@/frontend/features/builder/shared/types';
import { AspectRatioWidget } from './AspectRatioWidget';
import React from 'react';
import { RectangleHorizontal } from 'lucide-react';

const aspectRatioInspectorConfig: InspectorField[] = [
  {
    key: 'ratio',
    label: 'Aspect Ratio',
    type: 'select',
    options: ['16/9', '4/3', '1/1', '3/2', '2/1'],
  },
  {
    key: 'backgroundColor',
    label: 'Background Color',
    type: 'text',
    placeholder: '#f3f4f6',
  },
];

export const aspectRatioManifest: WidgetConfig = {
  label: 'Aspect Ratio',
  category: 'UI',
  description: 'A container that maintains a specific aspect ratio.',
  icon: RectangleHorizontal,
  tags: ['ui', 'layout', 'container'],
  defaults: {
    ratio: 16/9,
    backgroundColor: '#f3f4f6',
  },
  render: (props, children) => <AspectRatioWidget {...props}>{children}</AspectRatioWidget>,
  inspector: {
    fields: aspectRatioInspectorConfig,
  },
};
