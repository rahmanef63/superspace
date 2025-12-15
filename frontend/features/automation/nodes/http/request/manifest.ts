/**
 * HTTP Request Node
 * 
 * Make HTTP requests to any API.
 */

import { Globe2 } from 'lucide-react';
import type { NodeManifest } from '../../types';
import { httpMethodSection, httpAdvancedSection, authSection } from '../../../inspectors';

export const httpRequestManifest: NodeManifest = {
    key: 'http.request',
    label: 'HTTP Request',
    category: 'HTTP',
    description: 'Make HTTP requests to any API',
    icon: Globe2,

    defaults: {
        method: 'GET',
        url: '',
        headers: '{"Content-Type": "application/json"}',
        body: '',
        authType: 'none',
        timeout: 30000,
        followRedirects: true,
        responseType: 'json',
    },

    inspector: {
        sections: [
            httpMethodSection,
            authSection,
            httpAdvancedSection,
        ],
    },
};
