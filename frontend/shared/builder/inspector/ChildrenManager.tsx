/**
 * ChildrenManager — Layers Panel
 *
 * Shows children of the selected node in order.
 * - Reorder up/down
 * - Remove child edge (detach)
 * - Explode layout block: detaches all children and removes the wrapper node
 */
import React from 'react';
import { Button } from '@/components/ui';
import { ArrowUp, ArrowDown, X, Ungroup } from 'lucide-react';
import { useSharedCanvas } from '../canvas/core';

// Layout block types that can be "exploded" (broken apart into independent nodes)
const EXPLODABLE_TYPES = new Set([
    'threeColumn', 'twoColumn', 'grid', 'flex', 'row', 'column', 'div', 'section', 'container', 'accordion',
]);

interface ChildrenManagerProps {
    selectedNode?: any | null;
}

export const ChildrenManager: React.FC<ChildrenManagerProps> = ({ selectedNode: propNode }) => {
    const { childrenOrdered, reorderChild, removeChildEdge, setNodes, setEdges, selectedNodeId, selectedNode: ctxNode } = useSharedCanvas();

    const node = propNode ?? ctxNode;
    const nodeType = node?.data?.comp || node?.data?.type || '';
    const canExplode = EXPLODABLE_TYPES.has(nodeType) && (childrenOrdered?.length ?? 0) > 0;

    const handleExplode = () => {
        if (!node || !childrenOrdered?.length) return;
        const confirmed = window.confirm(
            `Explode "${nodeType}"? This removes the wrapper node and releases ${childrenOrdered.length} child(ren) as independent blocks.`
        );
        if (!confirmed) return;

        // Remove all edges from this parent to its children
        const childIds = new Set(childrenOrdered.map((c: any) => c.id));
        const parentId = node.id;

        setEdges((eds: any[]) => eds.filter((e: any) => !(e.source === parentId && childIds.has(e.target))));
        // Remove the parent wrapper node
        setNodes((ns: any[]) => ns.filter((n: any) => n.id !== parentId));
    };

    return (
        <div className="p-3 space-y-3">
            {/* Explode button for layout wrappers */}
            {canExplode && (
                <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{nodeType}</span> is a layout wrapper.
                        Explode it to release its {childrenOrdered?.length} child(ren) as independent blocks.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs"
                        onClick={handleExplode}
                    >
                        <Ungroup size={13} />
                        Explode Block
                    </Button>
                </div>
            )}

            {/* Children list */}
            <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Children ({childrenOrdered?.length ?? 0})
                </div>
                {childrenOrdered?.length ? (
                    childrenOrdered.map((c: any, idx: number) => (
                        <div
                            key={c.id}
                            className="flex items-center gap-2 rounded-md border border-border/50 bg-card px-2.5 py-1.5 text-xs"
                        >
                            <span className="flex-1 truncate font-medium">{c.label}</span>
                            <div className="flex items-center gap-0.5">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5"
                                    onClick={() => reorderChild(idx, idx - 1)}
                                    disabled={idx === 0}
                                    title="Move up"
                                >
                                    <ArrowUp size={10} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5"
                                    onClick={() => reorderChild(idx, idx + 1)}
                                    disabled={idx === childrenOrdered.length - 1}
                                    title="Move down"
                                >
                                    <ArrowDown size={10} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 text-destructive hover:text-destructive"
                                    onClick={() => removeChildEdge(c.edgeId)}
                                    title="Detach"
                                >
                                    <X size={10} />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground py-2">
                        No children. Connect nodes from this block's output handle to nest them.
                    </p>
                )}
            </div>
        </div>
    );
};
