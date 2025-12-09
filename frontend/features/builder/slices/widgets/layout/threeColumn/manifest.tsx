import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { ThreeColumnWidget } from './ThreeColumnWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const threeColumnManifest: WidgetConfig = {
    label: "Three Column",
    category: "Layout",
    description: "Three-panel layout with collapsible side panels using shared container.",
    icon: resolveWidgetIcon(undefined, 'Layout', 'threeColumn'),
    defaults: {
        leftWidth: 280,
        rightWidth: 320,
        leftCollapsed: false,
        rightCollapsed: false,
        resizable: true,
        showCollapseButtons: true,
        leftLabel: 'Left Panel',
        centerLabel: 'Main Content',
        rightLabel: 'Right Panel',
        className: '',
    },
    render: (props, children) => <ThreeColumnWidget {...props}>{children}</ThreeColumnWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'leftWidth',
                    label: 'Left Panel Width',
                    type: 'number',
                    placeholder: '280',
                }),
                createCustomField({
                    key: 'rightWidth',
                    label: 'Right Panel Width',
                    type: 'number',
                    placeholder: '320',
                }),
                createCustomField({
                    key: 'leftCollapsed',
                    label: 'Left Collapsed',
                    type: 'switch',
                }),
                createCustomField({
                    key: 'rightCollapsed',
                    label: 'Right Collapsed',
                    type: 'switch',
                }),
                createCustomField({
                    key: 'resizable',
                    label: 'Resizable Panels',
                    type: 'switch',
                }),
                createCustomField({
                    key: 'showCollapseButtons',
                    label: 'Show Collapse Buttons',
                    type: 'switch',
                }),
                createCustomField({
                    key: 'leftLabel',
                    label: 'Left Panel Label',
                    type: 'text',
                    placeholder: 'Left Panel',
                }),
                createCustomField({
                    key: 'centerLabel',
                    label: 'Center Panel Label',
                    type: 'text',
                    placeholder: 'Main Content',
                }),
                createCustomField({
                    key: 'rightLabel',
                    label: 'Right Panel Label',
                    type: 'text',
                    placeholder: 'Right Panel',
                }),
            ],
            createInspectorFieldGroups.layout()
        ),
    },
};
