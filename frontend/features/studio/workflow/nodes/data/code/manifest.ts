/**
 * Code / Function Node
 * 
 * Execute custom JavaScript code.
 */

import { Code } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const codeManifest: NodeManifest = {
    key: 'data.code',
    label: 'Code / Function',
    category: 'Data',
    description: 'Execute custom JavaScript code',
    icon: Code,

    defaults: {
        mode: 'runOnceForAllItems',
        language: 'javascript',
        code: '// Access input data with $input\n// Return data to pass to next node\nreturn $input.all();',
    },

    inspector: {
        fields: [
            {
                key: 'mode',
                label: 'Run Mode',
                type: 'select',
                options: ['runOnceForAllItems', 'runOnceForEachItem'],
                description: '"runOnceForAllItems" processes all data together, "runOnceForEachItem" runs for each item',
            },
            {
                key: 'language',
                label: 'Language',
                type: 'select',
                options: ['javascript'],
            },
            {
                key: 'code',
                label: 'Code',
                type: 'textarea',
                placeholder: '// Your JavaScript code here\nreturn items;',
                description: 'Available: $input, $node, $env, $json',
            },
        ],
    },
};
