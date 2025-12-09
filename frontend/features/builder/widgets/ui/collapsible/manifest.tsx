import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { CollapsibleWidget } from './CollapsibleWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const collapsibleManifest: WidgetConfig = {
    label: "Collapsible",
    category: "UI",
    description: "Expandable/collapsible section with toggle button.",
    icon: resolveWidgetIcon(undefined, 'UI', 'collapsible'),
    defaults: {
        triggerText: 'Toggle content',
        defaultOpen: false,
        className: '',
    },
    render: (props, children) => <CollapsibleWidget {...props}>{children}</CollapsibleWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'triggerText',
                    label: 'Trigger Text',
                    type: 'text',
                    placeholder: 'Toggle content',
                }),
                createCustomField({
                    key: 'defaultOpen',
                    label: 'Default Open',
                    type: 'switch',
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};
