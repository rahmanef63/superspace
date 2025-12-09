import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { DialogWidget } from './DialogWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const dialogManifest: WidgetConfig = {
    label: "Dialog",
    category: "UI",
    description: "Modal dialog popup for focused content.",
    icon: resolveWidgetIcon(undefined, 'UI', 'dialog'),
    defaults: {
        triggerText: 'Open Dialog',
        title: 'Dialog Title',
        description: 'Dialog description goes here.',
        showCloseButton: true,
        className: '',
    },
    render: (props, children) => <DialogWidget {...props}>{children}</DialogWidget>,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'triggerText',
                    label: 'Trigger Button Text',
                    type: 'text',
                    placeholder: 'Open Dialog',
                }),
                createCustomField({
                    key: 'title',
                    label: 'Dialog Title',
                    type: 'text',
                    placeholder: 'Dialog Title',
                }),
                createCustomField({
                    key: 'description',
                    label: 'Dialog Description',
                    type: 'textarea',
                    placeholder: 'Dialog description...',
                }),
                createCustomField({
                    key: 'showCloseButton',
                    label: 'Show Close Button',
                    type: 'switch',
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};
