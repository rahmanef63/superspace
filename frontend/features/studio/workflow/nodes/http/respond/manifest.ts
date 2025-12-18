/**
 * HTTP Respond Node
 * 
 * Send response back to webhook caller.
 */

import { Send } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const httpRespondManifest: NodeManifest = {
    key: 'http.respond',
    label: 'Respond to Webhook',
    category: 'HTTP',
    description: 'Send response back to webhook caller',
    icon: Send,

    defaults: {
        statusCode: 200,
        headers: '{}',
        body: '{"success": true}',
        respondWith: 'json',
    },

    inspector: {
        fields: [
            {
                key: 'statusCode',
                label: 'Status Code',
                type: 'number',
                placeholder: '200',
                defaultValue: 200,
            },
            {
                key: 'respondWith',
                label: 'Response Type',
                type: 'select',
                options: ['json', 'text', 'binary', 'lastNodeData'],
                description: '"lastNodeData" uses output from previous node',
            },
            {
                key: 'headers',
                label: 'Response Headers (JSON)',
                type: 'textarea',
                placeholder: '{}',
            },
            {
                key: 'body',
                label: 'Response Body',
                type: 'textarea',
                placeholder: '{"success": true, "data": ...}',
            },
        ],
    },
};
