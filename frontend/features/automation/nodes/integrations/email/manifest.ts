/**
 * Email Integration Node
 * 
 * Send emails via SMTP.
 */

import { Mail } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { authSection } from '../../../inspectors';

export const emailManifest: NodeManifest = {
    key: 'integration.email',
    label: 'Send Email',
    category: 'Integration',
    description: 'Send emails via SMTP',
    icon: Mail,

    defaults: {
        to: '',
        cc: '',
        subject: '',
        body: '',
        bodyType: 'text',
    },

    inspector: {
        sections: [
            {
                title: 'Recipients',
                fields: [
                    {
                        key: 'to',
                        label: 'To',
                        type: 'text',
                        placeholder: 'recipient@example.com',
                        required: true,
                    },
                    {
                        key: 'cc',
                        label: 'CC',
                        type: 'text',
                        placeholder: 'cc@example.com (optional)',
                    },
                    {
                        key: 'bcc',
                        label: 'BCC',
                        type: 'text',
                        placeholder: 'bcc@example.com (optional)',
                    },
                ],
            },
            {
                title: 'Content',
                fields: [
                    {
                        key: 'subject',
                        label: 'Subject',
                        type: 'text',
                        placeholder: 'Email Subject',
                        required: true,
                    },
                    {
                        key: 'bodyType',
                        label: 'Body Type',
                        type: 'select',
                        options: ['text', 'html'],
                    },
                    {
                        key: 'body',
                        label: 'Body',
                        type: 'textarea',
                        placeholder: 'Email content...',
                    },
                ],
            },
            authSection,
        ],
    },
};
