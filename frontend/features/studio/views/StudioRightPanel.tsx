import React from 'react';
import { Card, Button } from '@/components/ui';
import { Pin, PinOff, Trash2 } from 'lucide-react';
import { UnifiedInspector } from '@/frontend/shared/builder';
import { AutomationInspector } from '@/frontend/features/studio/components/AutomationInspector';
import { CMSInspectorRenderer } from '@/frontend/features/studio/components/CMSInspectorRenderer';
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
    return (
        <Card className="h-full flex flex-col border-0 rounded-none">
            {/* Compact action bar only when node is selected */}
            {selectedNodeId && (
                <div className="px-2 py-1.5 border-b flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Properties</span>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isPinned(selectedNodeId) ? unpin(selectedNodeId) : pin(selectedNodeId)}
                            className="h-6 w-6 p-0"
                            title={isPinned(selectedNodeId) ? 'Unpin' : 'Pin'}
                        >
                            {isPinned(selectedNodeId) ? <PinOff size={12} /> : <Pin size={12} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeSelectedNode}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </Button>
                    </div>
                </div>
            )}
            <div className="flex-1 overflow-auto">
                {mode === 'workflow' ? (
                    <AutomationInspector />
                ) : (
                    <UnifiedInspector
                        feature="studio"
                        customRenderers={{
                            navNode: CMSInspectorRenderer,
                            card: CMSInspectorRenderer,
                        }}
                    />
                )}
            </div>
        </Card>
    );
};
