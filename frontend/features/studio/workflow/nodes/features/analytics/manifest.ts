/**
 * Analytics Feature Nodes
 * 
 * Automation nodes for Analytics operations:
 * - Get metrics, Track events, Generate reports
 */

import { BarChart3, Activity, TrendingUp } from 'lucide-react';
import type { NodeManifest } from '../../types';

export const analyticsGetMetricsManifest: NodeManifest = {
    key: 'feature.analytics.getMetrics',
    label: 'Analytics: Get Metrics',
    category: 'Integration',
    description: 'Retrieve analytics metrics',
    icon: BarChart3,

    defaults: {
        metric: '',
        dateRange: 'last7days',
        groupBy: 'day',
    },

    inspector: {
        fields: [
            {
                key: 'metric',
                label: 'Metric',
                type: 'select',
                options: ['pageViews', 'sessions', 'users', 'conversions', 'revenue', 'custom'],
            },
            {
                key: 'dateRange',
                label: 'Date Range',
                type: 'select',
                options: ['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'custom'],
            },
            {
                key: 'groupBy',
                label: 'Group By',
                type: 'select',
                options: ['hour', 'day', 'week', 'month'],
            },
        ],
    },
};

export const analyticsTrackEventManifest: NodeManifest = {
    key: 'feature.analytics.trackEvent',
    label: 'Analytics: Track Event',
    category: 'Integration',
    description: 'Track a custom analytics event',
    icon: Activity,

    defaults: {
        eventName: '',
        properties: '{}',
        userId: '',
    },

    inspector: {
        fields: [
            {
                key: 'eventName',
                label: 'Event Name',
                type: 'text',
                placeholder: 'user_signup',
                required: true,
            },
            {
                key: 'properties',
                label: 'Properties (JSON)',
                type: 'textarea',
                placeholder: '{"plan": "premium", "source": "automation"}',
            },
            {
                key: 'userId',
                label: 'User ID',
                type: 'text',
                placeholder: '{{ $node.prev.data.userId }}',
            },
        ],
    },
};

export const analyticsGenerateReportManifest: NodeManifest = {
    key: 'feature.analytics.generateReport',
    label: 'Analytics: Generate Report',
    category: 'Integration',
    description: 'Generate an analytics report',
    icon: TrendingUp,

    defaults: {
        reportType: 'summary',
        format: 'json',
        dateRange: 'last30days',
    },

    inspector: {
        fields: [
            {
                key: 'reportType',
                label: 'Report Type',
                type: 'select',
                options: ['summary', 'detailed', 'comparison', 'funnel', 'cohort'],
            },
            {
                key: 'format',
                label: 'Output Format',
                type: 'select',
                options: ['json', 'csv', 'pdf'],
            },
            {
                key: 'dateRange',
                label: 'Date Range',
                type: 'select',
                options: ['last7days', 'last30days', 'lastQuarter', 'lastYear'],
            },
        ],
    },
};
