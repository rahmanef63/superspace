/**
 * Try/Catch Node
 * 
 * Handle errors in workflow execution.
 */

import { ShieldAlert } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const tryCatchManifest: NodeManifest = {
    key: 'error.tryCatch',
    label: 'Try / Catch',
    category: 'Error',
    description: 'Handle errors in workflow execution',
    icon: ShieldAlert,

    defaults: {
        continueOnFail: false,
        errorOutput: 'errorBranch',
    },

    inspector: {
        fields: [
            {
                key: 'continueOnFail',
                label: 'Continue On Fail',
                type: 'switch',
                description: 'Continue workflow even if this node fails',
            },
            {
                key: 'errorOutput',
                label: 'Error Output',
                type: 'select',
                options: ['errorBranch', 'errorWorkflow', 'stop'],
                description: 'What to do when an error occurs',
            },
        ],
    },
};
