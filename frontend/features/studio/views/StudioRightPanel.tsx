import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Pin, PinOff, Trash2, Bug } from 'lucide-react';
import { InspectorTabs } from '@/frontend/shared/builder/inspector/InspectorTabs';
import { AutomationInspector } from '@/frontend/features/studio/components/AutomationInspector';
import { StudioErrorLog } from '@/frontend/features/studio/components/StudioErrorLog';
import { useSharedCanvas } from '@/frontend/shared/builder';
import type { StudioMode } from '@/frontend/features/studio/registry';
import { getWidgetConfig } from '@/frontend/features/studio/ui/registry';
import { studioErrorLog } from '@/frontend/features/studio/ui/lib/studioErrorLog';

/** Extracts widget-specific inspector fields from the Studio widget registry. */
function studioGetWidgetFields(comp: string) {
    return getWidgetConfig(comp)?.inspector?.fields;
}

type RightTab = 'inspector' | 'errors';

interface RightPanelProps {
    mode: StudioMode;
    selectedNodeId: string | null;
    isPinned: (id: string) => boolean;
    pin: (id: string) => void;
    unpin: (id: string) => void;
    removeSelectedNode: () => void;
}

export const StudioRightPanel: React.FC<RightPanelProps> = ({
    mode,
    selectedNodeId,
    isPinned,
    pin,
    unpin,
    removeSelectedNode,
}) => {
    const { selectedNode } = useSharedCanvas();
    const [activeTab, setActiveTab] = useState<RightTab>('inspector');
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        setErrorCount(studioErrorLog.getErrors().length);
        return studioErrorLog.subscribe(() => {
            setErrorCount(studioErrorLog.getErrors().length);
        });
    }, []);

    return (
        <Card className="h-full flex flex-col border-0 rounded-none overflow-hidden">
            {/* Tab switcher + node action bar */}
            <div className="flex items-center border-b shrink-0">
                {/* Tabs */}
                <div className="flex items-center px-1 pt-1 gap-0.5 flex-1 min-w-0">
                    <button
                        onClick={() => setActiveTab('inspector')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-t-md transition-colors ${
                            activeTab === 'inspector'
                                ? 'bg-background border border-b-background border-border font-medium text-foreground -mb-px'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Inspector
                    </button>
                    <button
                        onClick={() => setActiveTab('errors')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-t-md transition-colors ${
                            activeTab === 'errors'
                                ? 'bg-background border border-b-background border-border font-medium text-foreground -mb-px'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Bug size={11} />
                        Errors
                        {errorCount > 0 && (
                            <span className="ml-0.5 text-[9px] px-1 py-0 rounded-full bg-destructive text-destructive-foreground font-bold leading-tight">
                                {errorCount > 99 ? '99+' : errorCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Node actions (shown when a node is selected and in inspector tab) */}
                {selectedNodeId && activeTab === 'inspector' && (
                    <div className="flex gap-1 px-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isPinned(selectedNodeId) ? unpin(selectedNodeId) : pin(selectedNodeId)}
                            className={`h-6 w-6 p-0 ${isPinned(selectedNodeId) ? 'text-amber-500' : ''}`}
                            title={isPinned(selectedNodeId) ? 'Unpin from preview' : 'Pin to preview'}
                        >
                            {isPinned(selectedNodeId) ? <PinOff size={12} /> : <Pin size={12} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeSelectedNode}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            title="Delete node"
                        >
                            <Trash2 size={12} />
                        </Button>
                    </div>
                )}
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'errors' ? (
                    <StudioErrorLog />
                ) : mode === 'workflow' ? (
                    <AutomationInspector />
                ) : (
                    <InspectorTabs selectedNode={selectedNode} getWidgetFields={studioGetWidgetFields} />
                )}
            </div>
        </Card>
    );
};
