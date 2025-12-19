import type { WidgetConfig } from '../../../types/index';
import { StatsBlock } from './StatsBlock';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { BarChart3 } from 'lucide-react';

export const statsManifest: WidgetConfig = {
    label: "Stats Grid",
    category: "Blocks",
    description: "Grid of statistic cards.",
    icon: BarChart3,
    defaults: {
        stats: [],
        columns: 4
    },
    render: (props: any) => <StatsBlock {...props} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'columns',
                label: 'Columns',
                type: 'number'
            }),
        ]
    }
};
