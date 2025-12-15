/**
 * Wait / Delay Node
 * 
 * Pause workflow execution.
 */

import { Timer } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const waitManifest: NodeManifest = {
    key: 'flow.wait',
    label: 'Wait / Delay',
    category: 'Logic',
    description: 'Pause workflow execution',
    icon: Timer,

    defaults: {
        amount: 1,
        unit: 'seconds',
        resumeType: 'afterDelay',
    },

    inspector: {
        fields: [
            {
                key: 'amount',
                label: 'Wait Time',
                type: 'number',
                placeholder: '5',
                required: true,
            },
            {
                key: 'unit',
                label: 'Unit',
                type: 'select',
                options: ['milliseconds', 'seconds', 'minutes', 'hours'],
            },
            {
                key: 'resumeType',
                label: 'Resume On',
                type: 'select',
                options: ['afterDelay', 'webhook', 'specificTime'],
            },
        ],
    },
};
