import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { FilterBlock } from '@/frontend/shared/builder/blocks/Filter';
import { createCustomField } from '@/frontend/features/builder/shared/inspector/standardFields';
import { Filter } from 'lucide-react';

export const filterManifest: WidgetConfig = {
    label: "Filter",
    category: "Blocks",
    description: "Search and filter bar.",
    icon: Filter,
    defaults: {
        className: ""
    },
    render: (props) => <FilterBlock {...props} fields={[]} onFilterChange={() => { }} onSearchChange={() => { }} />,
    inspector: {
        fields: []
    }
};
