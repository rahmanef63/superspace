/**
 * Retry Node
 * 
 * Retry failed node execution.
 */

import { RefreshCcw } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const retryManifest: NodeManifest = {
    key: 'error.retry',
    label: 'Retry on Error',
    category: 'Error',
    description: 'Retry failed node execution',
    icon: RefreshCcw,

    defaults: {
        maxRetries: 3,
        waitBetweenRetries: 1000,
        retryOn: 'allErrors',
    },

    inspector: {
        fields: [
            {
                key: 'maxRetries',
                label: 'Max Retries',
                type: 'number',
                placeholder: '3',
                description: 'Maximum number of retry attempts',
            },
            {
                key: 'waitBetweenRetries',
                label: 'Wait Between (ms)',
                type: 'number',
                placeholder: '1000',
                description: 'Time to wait between retries',
            },
            {
                key: 'retryOn',
                label: 'Retry On',
                type: 'select',
                options: ['allErrors', 'specificErrors', 'timeout'],
            },
        ],
    },
};
