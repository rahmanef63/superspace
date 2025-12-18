/**
 * Expression Node
 * 
 * Evaluate expressions and template strings.
 */

import { Braces } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { expressionField } from '../../../inspectors';

export const expressionManifest: NodeManifest = {
    key: 'data.expression',
    label: 'Expression',
    category: 'Data',
    description: 'Evaluate expressions and template strings',
    icon: Braces,

    defaults: {
        expression: '{{ $node["Previous"].data.field }}',
        outputName: 'result',
    },

    inspector: {
        fields: [
            {
                ...expressionField,
                key: 'expression',
                label: 'Expression',
                placeholder: '{{ $node["HTTP Request"].data.response.id }}',
                description: 'Use {{ }} for expressions. Access node data with $node["NodeName"]',
            },
            {
                key: 'outputName',
                label: 'Output Variable',
                type: 'text',
                placeholder: 'result',
                description: 'Name for the output variable',
            },
        ],
    },
};
