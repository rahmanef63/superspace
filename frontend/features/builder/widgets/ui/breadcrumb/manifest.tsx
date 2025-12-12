import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { BreadcrumbWidget } from './BreadcrumbWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/builder/shared/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/features/builder/shared/utils/iconUtils';
import React from 'react';

export const breadcrumbManifest: WidgetConfig = {
    label: "Breadcrumb",
    category: "Navigation",
    description: "Navigation breadcrumb trail for page hierarchy.",
    icon: resolveWidgetIcon(undefined, 'UI', 'breadcrumb'),
    defaults: {
        items: 'Home,Products,Category,Item',
        separator: 'chevron',
        className: '',
    },
    render: (props) => <BreadcrumbWidget {...props} />,
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'items',
                    label: 'Breadcrumb Items (comma-separated)',
                    type: 'text',
                    placeholder: 'Home,Products,Category,Item',
                }),
                createCustomField({
                    key: 'separator',
                    label: 'Separator Style',
                    type: 'select',
                    options: ['chevron', 'slash'],
                }),
            ],
            createInspectorFieldGroups.ui()
        ),
    },
};
