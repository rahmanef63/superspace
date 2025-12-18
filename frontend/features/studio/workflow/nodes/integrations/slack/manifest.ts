/**
 * Slack Integration Node
 * 
 * Send messages to Slack channels.
 */

import { MessageSquare } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { authSection } from '../../../inspectors';

export const slackManifest: NodeManifest = {
    key: 'integration.slack',
    label: 'Slack',
    category: 'Integration',
    description: 'Send messages to Slack channels',
    icon: MessageSquare,

    defaults: {
        operation: 'sendMessage',
        channel: '',
        text: '',
        attachments: '[]',
    },

    inspector: {
        sections: [
            {
                title: 'Operation',
                fields: [
                    {
                        key: 'operation',
                        label: 'Operation',
                        type: 'select',
                        options: ['sendMessage', 'uploadFile', 'getChannel', 'listChannels', 'updateMessage'],
                    },
                ],
            },
            {
                title: 'Message',
                fields: [
                    {
                        key: 'channel',
                        label: 'Channel',
                        type: 'text',
                        placeholder: '#general or channel ID',
                    },
                    {
                        key: 'text',
                        label: 'Message Text',
                        type: 'textarea',
                        placeholder: 'Hello from automation!',
                    },
                    {
                        key: 'attachments',
                        label: 'Attachments (JSON)',
                        type: 'textarea',
                        placeholder: '[]',
                    },
                ],
            },
            authSection,
        ],
    },
};
