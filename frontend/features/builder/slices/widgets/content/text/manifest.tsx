import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { TextWidget } from './TextWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const textManifest: WidgetConfig = {
  label: "Text",
  category: "Content",
  description: "A versatile text block with many styling options.",
  icon: resolveWidgetIcon(undefined, 'Content', 'text'),
  defaults: {
    tag: "p",
    content: "Text content",
    fontSize: "base",
    fontWeight: "normal",
    textColor: "gray-900",
    textAlign: "left",
    textTransform: "none",
    textDecoration: "none",
    letterSpacing: "normal",
    lineHeight: "normal",
    fontFamily: "sans",
    fontStyle: "normal",
    margin: "none",
    padding: "none",
    background: "none",
    border: false,
    borderColor: "gray-200",
    borderRadius: "none",
    shadow: "none",
    maxWidth: "none",
    truncate: false,
    whitespace: "normal",
    className: ""
  },
  render: (p) => <TextWidget {...p} />,
  inspector: {
    fields: combineFields(
      [
        createCustomField({
          key: 'tag',
          label: 'HTML Tag',
          type: 'select',
          options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'strong', 'em', 'small']
        }),
        createCustomField({
          key: 'content',
          label: 'Content',
          type: 'textarea',
          placeholder: 'Text content'
        }),
        createCustomField({
          key: 'truncate',
          label: 'Truncate Text',
          type: 'switch'
        }),
        createCustomField({
          key: 'whitespace',
          label: 'Whitespace',
          type: 'select',
          options: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap']
        }),
      ],
      createInspectorFieldGroups.content()
    )
  }
};
