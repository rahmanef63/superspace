import React from 'react';
import { UnifiedInspector } from './UnifiedInspector';
import { ChatAI } from './ChatAI';
import { ChildrenManager } from './ChildrenManager';
import { Settings2, Bot, Layers } from 'lucide-react';

interface InspectorTabsProps {
  selectedNode: any | null;
}

type InspectorTab = 'properties' | 'layers' | 'chat-ai';

const TABS: { id: InspectorTab; label: string; icon: React.ElementType }[] = [
  { id: 'properties', label: 'Properties', icon: Settings2 },
  { id: 'layers',     label: 'Layers',     icon: Layers },
  { id: 'chat-ai',    label: 'AI',         icon: Bot },
];

export function InspectorTabs({ selectedNode }: InspectorTabsProps) {
  const [activeTab, setActiveTab] = React.useState<InspectorTab>('properties');

  return (
    <div className="h-full flex flex-col overflow-y-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-0 mx-3 mt-3 bg-muted rounded-lg p-0.5 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded-md transition-colors ${
              activeTab === id
                ? 'bg-background text-foreground shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 mt-1">
        {activeTab === 'properties' && <UnifiedInspector selectedNode={selectedNode} />}
        {activeTab === 'layers'     && <ChildrenManager selectedNode={selectedNode} />}
        {activeTab === 'chat-ai'    && <ChatAI selectedNode={selectedNode} />}
      </div>
    </div>
  );
}
