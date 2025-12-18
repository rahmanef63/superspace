/**
 * Schedule Trigger Node
 * 
 * Run workflow on a schedule (cron expression).
 */

import { Clock } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const scheduleTriggerManifest: NodeManifest = {
    key: 'trigger.schedule',
    label: 'Schedule Trigger',
    category: 'Trigger',
    description: 'Run workflow on a schedule (cron expression)',
    icon: Clock,

    defaults: {
        cronExpression: '0 * * * *',
        timezone: 'UTC',
    },

    inspector: {
        fields: [
            {
                key: 'cronExpression',
                label: 'Cron Expression',
                type: 'text',
                placeholder: '0 * * * *',
                description: 'Example: 0 * * * * (every hour), */5 * * * * (every 5 min)',
                required: true,
            },
            {
                key: 'timezone',
                label: 'Timezone',
                type: 'select',
                options: ['UTC', 'Asia/Jakarta', 'Asia/Singapore', 'America/New_York', 'Europe/London', 'Asia/Tokyo'],
            },
            {
                key: 'enabled',
                label: 'Enabled',
                type: 'switch',
                defaultValue: true,
            },
        ],
    },
};
