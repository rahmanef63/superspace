import type { WidgetConfig } from '../../../types/index';
import { ChartBlock } from './ChartBlock';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Activity } from 'lucide-react';

export const chartManifest: WidgetConfig = {
    label: "Chart",
    category: "Blocks",
    description: "Visual data representation.",
    icon: Activity,
    defaults: {
        type: "bar",
        title: "Sales Data",
        description: "Monthly revenue stats",
        className: ""
    },
    render: (props: any) => <ChartBlock {...props} type={props.type || "bar"} data={props.data || [{ name: 'A', value: 100 }, { name: 'B', value: 200 }]} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'type',
                label: 'Chart Type',
                type: 'select',
                options: ['line', 'bar', 'pie', 'area']
            })
        ]
    }
};
