import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { TooltipWidget } from './TooltipWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const tooltipManifest: WidgetConfig = {
    label: "Tooltip",
    category: "UI",
    description: "Hover tooltip for providing additional context.",
    icon: resolveWidgetIcon(undefined, 'UI', 'tooltip'),
    defaults: {
        content: 'Tooltip content',
        side: 'top',
        triggerText: 'Hover me',
        className: '',
    },
    render: (props, children) => <TooltipWidget {...props}>{children}</TooltipWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'content',
                    label: 'Tooltip Content',
                    type: 'text',
                    placeholder: 'Tooltip content',
                }),
                createCustomField({
                    key: 'triggerText',
                    label: 'Trigger Text',
                    type: 'text',
                    placeholder: 'Hover me',
                }),
                createCustomField({
                    key: 'side',
                    label: 'Side',
                    type: 'select',
                    options: ['top', 'right', 'bottom', 'left'],
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};
