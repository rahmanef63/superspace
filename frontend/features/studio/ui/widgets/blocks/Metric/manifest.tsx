import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { MetricCardBlock } from '@/frontend/shared/builder/blocks/Metric';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Sigma } from 'lucide-react';

export const metricCardManifest: WidgetConfig = {
    label: "Metric Card",
    category: "Blocks",
    description: "Single statistic card.",
    icon: Sigma,
    defaults: {
        title: "Revenue",
        value: "$12,345",
        className: ""
    },
    render: (props) => <MetricCardBlock {...props} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'value',
                label: 'Value',
                type: 'text'
            })
        ]
    }
};
