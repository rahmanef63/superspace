import type { WidgetConfig } from '../../../types/index';
import { EventsBlock } from './EventsBlock';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Calendar } from 'lucide-react';

export const eventsManifest: WidgetConfig = {
    label: "Events List",
    category: "Blocks",
    description: "Display upcoming events.",
    icon: Calendar,
    defaults: {
        title: "Upcoming",
        maxEvents: 5,
        events: [],
        showOverdue: true
    },
    render: (props: any) => <EventsBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'maxEvents',
                label: 'Max Events',
                type: 'number'
            }),
            createCustomField({
                key: 'description',
                label: 'Description',
                type: 'text'
            }),
            createCustomField({
                key: 'showOverdue',
                label: 'Show Overdue',
                type: 'switch'
            }),
        ]
    }
};

