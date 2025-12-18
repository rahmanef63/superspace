/**
 * Webhook Trigger Node
 * 
 * Receive HTTP requests to trigger workflow.
 */

import { Webhook } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { authSection } from '../../../inspectors';

export const webhookTriggerManifest: NodeManifest = {
    key: 'trigger.webhook',
    label: 'Webhook Trigger',
    category: 'Trigger',
    description: 'Receive HTTP requests to trigger workflow',
    icon: Webhook,

    defaults: {
        path: '/webhook/my-workflow',
        method: 'POST',
        responseMode: 'onReceived',
        authType: 'none',
    },

    inspector: {
        sections: [
            {
                title: 'Webhook Configuration',
                fields: [
                    {
                        key: 'path',
                        label: 'Webhook Path',
                        type: 'text',
                        placeholder: '/webhook/my-workflow',
                        required: true,
                    },
                    {
                        key: 'method',
                        label: 'HTTP Method',
                        type: 'select',
                        options: ['GET', 'POST', 'PUT', 'DELETE'],
                    },
                    {
                        key: 'responseMode',
                        label: 'Response Mode',
                        type: 'select',
                        options: ['onReceived', 'lastNode'],
                        description: '"onReceived" responds immediately, "lastNode" waits for workflow completion',
                    },
                ],
            },
            authSection,
        ],
    },
};
