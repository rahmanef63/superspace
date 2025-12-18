import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { KanbanBlock } from '@/frontend/shared/builder/blocks/Kanban';
import { createCustomField } from '@/frontend/features/builder/shared/inspector/standardFields';
import { KanbanSquare } from 'lucide-react';

export const kanbanManifest: WidgetConfig = {
    label: "Kanban",
    category: "Blocks",
    description: "Drag-and-drop task board.",
    icon: KanbanSquare,
    defaults: {
        title: "Project Board",
        className: ""
    },
    render: (props) => <KanbanBlock {...props} columns={props.columns || [{ id: '1', title: 'To Do', items: [] }]} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            })
        ]
    }
};
