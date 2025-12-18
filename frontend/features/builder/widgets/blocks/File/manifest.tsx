import type { WidgetConfig } from '@/frontend/features/builder/shared/types';
import { FileBlock } from '@/frontend/shared/builder/blocks/File';
import { createCustomField } from '@/frontend/features/builder/shared/inspector/standardFields';
import { FileInput } from 'lucide-react';

export const fileManifest: WidgetConfig = {
    label: "File Manager",
    category: "Blocks",
    description: "File upload and list.",
    icon: FileInput,
    defaults: {
        allowUpload: true,
        className: ""
    },
    render: (props) => <FileBlock {...props} files={[]} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'allowUpload',
                label: 'Allow Upload',
                type: 'switch'
            })
        ]
    }
};
