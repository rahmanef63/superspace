import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { RichTextBlock } from '@/frontend/features/studio/ui/widgets/blocks/RichText';
import { createCustomField } from '@/frontend/features/studio/ui/inspector/standardFields';
import { FileText } from 'lucide-react';

export const richTextManifest: WidgetConfig = {
    label: "Rich Text",
    category: "Blocks",
    description: "WYSIWYG Editor.",
    icon: FileText,
    defaults: {
        content: "<p>Initial content...</p>",
        editable: true,
        className: ""
    },
    render: (props) => <RichTextBlock {...props} content={props.content || "<p>Hello World</p>"} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'editable',
                label: 'Editable',
                type: 'switch'
            })
        ]
    }
};
