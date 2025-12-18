/**
 * Event Trigger Node
 * 
 * Trigger on internal system events.
 */

import { Zap } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const eventTriggerManifest: NodeManifest = {
    key: 'trigger.event',
    label: 'Event Trigger',
    category: 'Trigger',
    description: 'Trigger on internal system events',
    icon: Zap,

    defaults: {
        eventType: 'database.update',
        filter: '',
    },

    inspector: {
        fields: [
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: [
                    'database.insert',
                    'database.update',
                    'database.delete',
                    'user.login',
                    'user.register',
                    'form.submit',
                    'file.upload',
                    'custom',
                ],
                required: true,
            },
            {
                key: 'filter',
                label: 'Filter Expression',
                type: 'textarea',
                placeholder: 'e.g. data.status === "active"',
                description: 'Optional filter to match specific events',
            },
            {
                key: 'customEventName',
                label: 'Custom Event Name',
                type: 'text',
                placeholder: 'my.custom.event',
                description: 'Required when Event Type is "custom"',
            },
        ],
    },
};
