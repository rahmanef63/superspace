import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { CalendarBlock } from '@/frontend/shared/builder/blocks/Calendar';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Calendar } from 'lucide-react';

export const calendarManifest: WidgetConfig = {
    label: "Calendar",
    category: "Blocks",
    description: "Date picker or event view.",
    icon: Calendar,
    defaults: {
        mode: "single",
        className: ""
    },
    render: (props) => <CalendarBlock {...props} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'mode',
                label: 'Selection Mode',
                type: 'select',
                options: ['single', 'multiple', 'range']
            })
        ]
    }
};
