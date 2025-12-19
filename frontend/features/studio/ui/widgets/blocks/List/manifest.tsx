import type { WidgetConfig } from '../../../types/index';
import { ListBlock } from './ListBlock';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { List } from 'lucide-react';

export const listManifest: WidgetConfig = {
    label: "List Block",
    category: "Blocks",
    description: "Generic scrollable list.",
    icon: List,
    defaults: {
        title: "Recent Items",
        maxItems: 5,
        items: [],
        showBadges: true,
        emptyMessage: "No items"
    },
    render: (props: any) => <ListBlock {...props} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'maxItems',
                label: 'Max Items',
                type: 'number'
            }),
            createCustomField({
                key: 'description',
                label: 'Description',
                type: 'text'
            }),
            createCustomField({
                key: 'showBadges',
                label: 'Show Badges',
                type: 'boolean' // Assuming 'boolean' or 'switch' is supported by createCustomField logic or standard fields
            }),
            createCustomField({
                key: 'emptyMessage',
                label: 'Empty Message',
                type: 'text'
            }),
        ]
    }
};
