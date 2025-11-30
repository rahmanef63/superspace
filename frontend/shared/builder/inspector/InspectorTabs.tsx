import React from 'react';
import { Tabs } from '@/components/ui';
import { UnifiedInspector } from './UnifiedInspector';
import { ChatAI } from './ChatAI';

interface InspectorTabsProps {
  selectedNode: any | null;
}

export function InspectorTabs({ selectedNode }: InspectorTabsProps) {
  const [activeTab, setActiveTab] = React.useState('properties');

  return (
    <div className="h-full flex flex-col overflow-y-hidden">
      <div className="grid grid-cols-2 mx-4 mt-4 border rounded-lg">
        <button
          className={`px-3 py-2 text-xs rounded-l-lg ${
            activeTab === 'properties' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`px-3 py-2 text-xs rounded-r-lg ${
            activeTab === 'chat-ai' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setActiveTab('chat-ai')}
        >
          Chat AI
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-2">
        {activeTab === 'properties' && (
          <UnifiedInspector selectedNode={selectedNode} />
        )}
        {activeTab === 'chat-ai' && (
          <ChatAI selectedNode={selectedNode} />
        )}
      </div>
    </div>
  );
}
