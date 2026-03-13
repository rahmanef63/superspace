import type { WidgetConfig } from '../../../types/index';
import { TeamBlock } from './TeamBlock';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Users } from 'lucide-react';

export const teamManifest: WidgetConfig = {
    label: "Team",
    category: "Blocks",
    description: "Display team composition by role.",
    icon: Users,
    defaults: {
        title: "Team Composition",
        description: "Members by role",
        roles: {},
        loading: false,
    },
    render: (props: any) => <TeamBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({ key: 'title', label: 'Title', type: 'text' }),
            createCustomField({ key: 'description', label: 'Description', type: 'text' }),
        ]
    }
};
