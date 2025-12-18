/**
 * Manual Trigger Node
 * 
 * Start workflow manually with custom input data.
 */

import { Play } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const manualTriggerManifest: NodeManifest = {
    key: 'trigger.manual',
    label: 'Manual Trigger',
    category: 'Trigger',
    description: 'Start workflow manually with custom input data',
    icon: Play,

    defaults: {
        name: 'Manual Run',
        inputData: '{}',
    },

    inspector: {
        fields: [
            {
                key: 'name',
                label: 'Trigger Name',
                type: 'text',
                placeholder: 'My Trigger',
            },
            {
                key: 'inputData',
                label: 'Input Data (JSON)',
                type: 'textarea',
                placeholder: '{"key": "value"}',
                description: 'Initial data passed to the workflow',
            },
        ],
    },
};
