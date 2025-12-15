/**
 * Switch Node
 * 
 * Route to different branches based on value.
 */

import { ArrowRightLeft } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const switchManifest: NodeManifest = {
    key: 'flow.switch',
    label: 'Switch',
    category: 'Logic',
    description: 'Route to different branches based on value',
    icon: ArrowRightLeft,

    defaults: {
        mode: 'value',
        dataToSwitch: '',
        fallbackOutput: 'default',
    },

    inspector: {
        fields: [
            {
                key: 'mode',
                label: 'Mode',
                type: 'select',
                options: ['value', 'expression', 'regex'],
            },
            {
                key: 'dataToSwitch',
                label: 'Data to Evaluate',
                type: 'textarea',
                placeholder: '{{ $node.prev.data.type }}',
            },
            {
                key: 'case1Value',
                label: 'Case 1: Value',
                type: 'text',
                placeholder: 'typeA',
            },
            {
                key: 'case2Value',
                label: 'Case 2: Value',
                type: 'text',
                placeholder: 'typeB',
            },
            {
                key: 'case3Value',
                label: 'Case 3: Value',
                type: 'text',
                placeholder: 'typeC',
            },
            {
                key: 'fallbackOutput',
                label: 'Fallback',
                type: 'select',
                options: ['default', 'none', 'error'],
            },
        ],
    },
};
