import React from 'react';
import { Card, Button } from '@/components/ui';
import { Pin, PinOff, Trash2 } from 'lucide-react';
import { InspectorTabs } from '@/frontend/shared/builder/inspector/InspectorTabs';
import { AutomationInspector } from '@/frontend/features/studio/components/AutomationInspector';
import { useSharedCanvas } from '@/frontend/shared/builder';
import type { StudioMode } from '@/frontend/features/studio/registry';

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

    return (
        <Card className="h-full flex flex-col border-0 rounded-none overflow-hidden">
            {/* Compact action bar — shows when a node is selected */}
            {selectedNodeId && (
                <div className="px-2 py-1.5 border-b flex items-center justify-between shrink-0">
                    <span className="text-xs font-medium text-muted-foreground truncate">
                        {selectedNode?.data?.comp ?? 'Node'}
                    </span>
                    <div className="flex gap-1 shrink-0">
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
                </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
                {mode === 'workflow' ? (
                    <AutomationInspector />
                ) : (
                    <InspectorTabs selectedNode={selectedNode} />
                )}
            </div>
        </Card>
    );
};
