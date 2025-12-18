/**
 * Set Variable Node
 * 
 * Set or create a variable in workflow context.
 */

import { Variable } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { variableNameField, valueField, valueTypeField } from '../../../inspectors';

export const setVariableManifest: NodeManifest = {
    key: 'data.set',
    label: 'Set Variable',
    category: 'Data',
    description: 'Set or create a variable in workflow context',
    icon: Variable,

    defaults: {
        variableName: 'myVariable',
        value: '',
        valueType: 'string',
        keepOnlySet: false,
    },

    inspector: {
        fields: [
            variableNameField,
            valueTypeField,
            valueField,
            {
                key: 'keepOnlySet',
                label: 'Keep Only This Value',
                type: 'switch',
                description: 'Remove other data and keep only this variable',
            },
        ],
    },
};
