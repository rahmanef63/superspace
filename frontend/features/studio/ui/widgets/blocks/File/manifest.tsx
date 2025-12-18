import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { FileBlock } from '@/frontend/shared/builder/blocks/File';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
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
