/**
 * Loop Node
 * 
 * Process each item in an array.
 */

import { Repeat } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const loopManifest: NodeManifest = {
    key: 'flow.loop',
    label: 'Loop Over Items',
    category: 'Logic',
    description: 'Process each item in an array',
    icon: Repeat,

    defaults: {
        batchSize: 1,
        execution: 'sequential',
    },

    inspector: {
        fields: [
            {
                key: 'batchSize',
                label: 'Batch Size',
                type: 'number',
                placeholder: '1',
                description: 'Number of items to process at once',
            },
            {
                key: 'execution',
                label: 'Execution',
                type: 'select',
                options: ['sequential', 'parallel'],
                description: 'Sequential waits for each item, parallel runs all together',
            },
            {
                key: 'maxIterations',
                label: 'Max Iterations',
                type: 'number',
                placeholder: '100',
                description: 'Safety limit for iterations (optional)',
            },
        ],
    },
};
