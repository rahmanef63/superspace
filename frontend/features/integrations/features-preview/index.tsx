import React, { useState } from 'react';
import { IntegrationsDashboard } from '../components/IntegrationsDashboard';
import { IntegrationsData, ConnectedIntegration, AVAILABLE_INTEGRATIONS } from '../types';

export const IntegrationsPreview = () => {
    // Mock Data
    const [integrations, setIntegrations] = useState<ConnectedIntegration[]>([
        {
            _id: '1',
            integrationId: 'slack',
            workspaceId: 'ws1',
            status: 'active',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
            lastSyncAt: Date.now() - 1000 * 60 * 5,
        },
        {
            _id: '2',
            integrationId: 'github',
            workspaceId: 'ws1',
            status: 'active',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
            lastSyncAt: Date.now() - 1000 * 60 * 30,
        },
        {
            _id: '3',
            integrationId: 'hubspot',
            workspaceId: 'ws1',
            status: 'error',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
            lastSyncAt: Date.now() - 1000 * 60 * 60 * 2,
        }
    ]);

    const handleConnect = async (integrationId: string, name: string) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newIntegration: ConnectedIntegration = {
            _id: Math.random().toString(),
            integrationId,
            workspaceId: 'mock-ws',
            status: 'active',
            createdAt: Date.now(),
            lastSyncAt: Date.now()
        };
        setIntegrations(prev => [...prev, newIntegration]);
    };

    const handleDisconnect = async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIntegrations(prev => prev.filter(i => i._id !== id));
    };

    const data: IntegrationsData = {
        isLoading: false,
        integrations,
        stats: {
            totalConnected: integrations.length,
            activeIntegrations: integrations.filter(i => i.status === 'active').length,
            totalAvailable: AVAILABLE_INTEGRATIONS.length
        }
    };

    return (
        <div className="p-6">
            <IntegrationsDashboard
                data={data}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
            />
        </div>
    );
};

export default IntegrationsPreview;
