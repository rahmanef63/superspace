import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { ButtonWidget } from './ButtonWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const buttonManifest: WidgetConfig = {
  label: "Button",
  category: "Action",
  description: "Interactive button for user actions.",
  icon: resolveWidgetIcon(undefined, 'Action', 'button'),
  defaults: { 
    text: "Button", 
    variant: "default", 
    size: "md", 
    href: "", 
    className: "",
    icon: "",
    iconPosition: "left",
    disabled: false,
    fullWidth: false,
    rounded: "md",
    shadow: "sm",
    animation: "none",
    gradient: false,
    borderWidth: "1",
    padding: "md",
    margin: "none",
    textAlign: "center",
    fontWeight: "medium",
    textTransform: "none",
    letterSpacing: "normal"
  },
  render: (p) => p.href ? (<a href={p.href} className="inline-block"><ButtonWidget {...p} /></a>) : (<ButtonWidget {...p} />),
  inspector: {
    fields: combineFields(
      [
        createCustomField({
          key: 'text',
          label: 'Button Text',
          type: 'text',
          placeholder: 'Button'
        }),
        createCustomField({
          key: 'href',
          label: 'Link (optional)',
          type: 'text',
          placeholder: 'https://example.com'
        }),
        createCustomField({
          key: 'icon',
          label: 'Icon',
          type: 'text',
          placeholder: 'Icon name or emoji'
        }),
        createCustomField({
          key: 'iconPosition',
          label: 'Icon Position',
          type: 'select',
          options: ['left', 'right', 'top', 'bottom']
        }),
        createCustomField({
          key: 'fullWidth',
          label: 'Full Width',
          type: 'switch'
        }),
        createCustomField({
          key: 'gradient',
          label: 'Gradient Background',
          type: 'switch'
        }),
      ],
      createInspectorFieldGroups.interactive()
    )
  }
};
