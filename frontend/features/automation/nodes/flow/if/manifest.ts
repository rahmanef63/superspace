/**
 * IF / Condition Node
 * 
 * Branch workflow based on conditions.
 */

import { GitBranch } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { conditionSection } from '../../../inspectors';

export const ifConditionManifest: NodeManifest = {
    key: 'flow.if',
    label: 'IF / Condition',
    category: 'Logic',
    description: 'Branch workflow based on conditions',
    icon: GitBranch,

    defaults: {
        leftValue: '',
        operator: 'equals',
        rightValue: '',
        combineWith: 'AND',
    },

    inspector: {
        sections: [
            conditionSection,
            {
                title: 'Options',
                fields: [
                    {
                        key: 'combineWith',
                        label: 'Combine Multiple Conditions',
                        type: 'select',
                        options: ['AND', 'OR'],
                    },
                ],
                collapsed: true,
            },
        ],
    },
};
