/**
 * Database Integration Node
 * 
 * Query databases (SQL/NoSQL).
 */

import { Database } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { authSection } from '../../../inspectors';

export const databaseManifest: NodeManifest = {
    key: 'integration.database',
    label: 'Database',
    category: 'Integration',
    description: 'Query databases (SQL/NoSQL)',
    icon: Database,

    defaults: {
        operation: 'select',
        table: '',
        query: '',
        parameters: '[]',
    },

    inspector: {
        sections: [
            {
                title: 'Operation',
                fields: [
                    {
                        key: 'operation',
                        label: 'Operation',
                        type: 'select',
                        options: ['select', 'insert', 'update', 'delete', 'rawQuery'],
                    },
                    {
                        key: 'table',
                        label: 'Table/Collection',
                        type: 'text',
                        placeholder: 'users',
                    },
                ],
            },
            {
                title: 'Query',
                fields: [
                    {
                        key: 'query',
                        label: 'Query / Filter',
                        type: 'textarea',
                        placeholder: 'SELECT * FROM users WHERE id = ?',
                        description: 'SQL query or NoSQL filter',
                    },
                    {
                        key: 'parameters',
                        label: 'Parameters (JSON)',
                        type: 'textarea',
                        placeholder: '["value1", "value2"]',
                    },
                ],
            },
            authSection,
        ],
    },
};
