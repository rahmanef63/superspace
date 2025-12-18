import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { GridWidget } from './GridWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/studio/ui/utils/iconUtils';
import React from 'react';

export const gridManifest: WidgetConfig = {
    label: "Grid",
    category: "Layout",
    description: "CSS Grid layout container with configurable columns and gap.",
    icon: resolveWidgetIcon(undefined, 'Layout', 'grid'),
    defaults: {
        columns: '3',
        gap: 'md',
        placeItems: 'stretch',
        className: '',
    },
    render: (props, children) => <GridWidget {...props}>{children}</GridWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'columns',
                    label: 'Columns',
                    type: 'select',
                    options: ['1', '2', '3', '4', '5', '6', '12'],
                }),
                createCustomField({
                    key: 'gap',
                    label: 'Gap',
                    type: 'select',
                    options: ['none', 'sm', 'md', 'lg', 'xl'],
                }),
                createCustomField({
                    key: 'placeItems',
                    label: 'Place Items',
                    type: 'select',
                    options: ['start', 'center', 'end', 'stretch'],
                }),
            ],
            createInspectorFieldGroups.layout()
        ),
    },
};
