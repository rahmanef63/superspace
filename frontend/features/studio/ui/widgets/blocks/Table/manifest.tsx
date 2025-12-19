import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { TableBlock } from '@/frontend/features/studio/ui/widgets/blocks/Table';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Table } from 'lucide-react';

export const tableManifest: WidgetConfig = {
    label: "Table",
    category: "Blocks",
    description: "Data grid with sorting.",
    icon: Table,
    defaults: {
        title: "Data Table",
        searchable: true,
        className: ""
    },
    render: (props) => <TableBlock {...props} columns={[]} data={[]} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'searchable',
                label: 'Searchable',
                type: 'switch'
            })
        ]
    }
};
