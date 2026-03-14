/**
 * Studio Page - Unified Visual Builder
 * 
 * Combines CMS Builder (UI widgets) and Automation (workflow nodes) into
 * a single canvas experience with mode switching and data binding.
 */

"use client";

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import type { Id } from "@convex/_generated/dataModel";
import { SharedCanvasProvider, useSharedCanvas } from '@/frontend/shared/builder';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable';
import { Card, CardTitle, Button, Input, Label } from '@/components/ui';
import { ThreeColumnLayoutAdvanced } from '@/frontend/shared/ui/layout/container';

import { SharedCanvas } from '@/frontend/shared/ui';
import { CMSPreview } from '@/frontend/shared/ui';
import { UnifiedLibrary } from '@/frontend/shared/builder';
import { UnifiedInspector } from '@/frontend/shared/builder';
import { ExecutionPanel } from '@/frontend/shared/builder/flows';
import { DnDProvider } from '@/frontend/shared/builder';

import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { registerStudioComponents, registerStudioLibraryTabs, type StudioMode } from '../registry';
import {
    toN8nWorkflow,
    fromN8nWorkflow,
    legacyFlowToStudioFlow,
} from '../workflow/schema/n8n-converter';
import { createStudioDocument } from '../workflow/schema/studio-unified.types';

// Node types from both features
import { ShadcnNode } from '@/frontend/features/studio/ui/slices/canvas/components/ShadcnNode';
import { GroupNode } from '@/frontend/features/studio/ui/slices/canvas/components/GroupNode';
import { AutomationNode } from '@/frontend/features/studio/components/AutomationNode';
import { AutomationInspector } from '@/frontend/features/studio/components/AutomationInspector';
import { CMSInspectorRenderer } from '@/frontend/features/studio/components/CMSInspectorRenderer';
import { Renderer } from '@/frontend/features/studio/ui/slices/renderer/components/Renderer';
import { toSchema } from '@/frontend/features/studio/ui/hooks/useSchema';
import { useAutomationExecution } from '@/frontend/features/studio/hooks/useAutomationExecution';
import { TemplateLibrary } from '@/frontend/shared/builder';
import { cmsTemplateProvider } from '@/frontend/features/studio/ui/state/templateProvider';
import { TemplatesGallery } from '@/frontend/features/studio/components/TemplatesGallery';
import type { NodeTypes, EdgeTypes } from 'reactflow';

// Custom edge types for data/event binding
import { studioEdgeTypes } from '../connections';

// ============================================================================
// Combined Node Types
// ============================================================================

const nodeTypes: NodeTypes = {
    shadcnNode: ShadcnNode,
    groupNode: GroupNode as any,
    automationNode: AutomationNode as any,
};

// Combined edge types (data binding + event binding)
const edgeTypes: EdgeTypes = {
    ...studioEdgeTypes,
};

// ============================================================================
// UI Components  
// ============================================================================

// ... (imports will be handled by the replacement)

import { StudioGlobalHeader } from '../views/header/StudioGlobalHeader';
import { StudioLeftPanel } from '../views/StudioLeftPanel';
import { StudioRightPanel } from '../views/StudioRightPanel';
import { StudioDocsDialog } from '../components/StudioDocsDialog';

// ... (keep necessary imports)

// Removing: TopBarButton, ModeToggle, LeftPanel, RightPanel, TopBar, StudioLeftHeader, StudioCenterHeader

// ============================================================================
// Main Layout
// ============================================================================

interface StudioLayoutInnerProps {
    workspaceId?: Id<"workspaces">;
}

const StudioLayoutInner: React.FC<StudioLayoutInnerProps> = ({ workspaceId }) => {
    void workspaceId;

    const {
        nodes,
        edges,
        selectedNodeId,
        setSelectedNodeId,
        createNode,
        removeSelectedNode,
        setNodes,
        setEdges,
        isPinned,
        pin,
        unpin,
        pinnedIds,
        groupSelectedNodes,
        ungroupNode,
        focusedGroupId,
        enterGroup,
        exitGroup,
        clearAll,
        undo,
        redo,
        canUndo,
        canRedo,
        activeWs,
        setActiveWs,
        activeRoute,
        setActiveRoute,
        menuOverride,
        setMenuOverride,
        commands,
    } = useSharedCanvas();

    const {
        status,
        result,
        logs,
        steps,
        validate,
        run,
        stop,
        clearLogs,
        exportFlow,
        importFlow,
        clearFlow,
    } = useAutomationExecution();

    // State
    const [mode, setMode] = useState<StudioMode>('unified');
    const [leftTab, setLeftTab] = useState<'library' | 'templates' | 'settings'>('library');
    const [layoutTab, setLayoutTab] = useState<'split' | 'canvas' | 'preview'>('split');
    const [contentTab, setContentTab] = useState<'preview' | 'json'>('preview');
    const [previewMode, setPreviewMode] = useState<'design' | 'interactive'>('design');
    // Panel collapse state — managed here so the header (outside ThreeColumnLayoutAdvanced) can access it
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);

    // Schema for preview
    const schema = useMemo(() => toSchema(nodes as any, edges as any), [nodes, edges]);

    // Handlers
    const handleAddComponent = useCallback((compKey: string) => {
        createNode(compKey);
    }, [createNode]);

    const handleImportTemplate = useCallback((template: any) => {
        clearFlow();
        const idMap: Record<string, string> = {};
        const newNodes = template.nodes.map((templateNode: any) => {
            const newId = `${templateNode.id}-${Date.now()}`;
            idMap[templateNode.id] = newId;
            return {
                id: newId,
                type: templateNode.type || 'automationNode',
                position: templateNode.position,
                data: templateNode.data,
            };
        });
        const newEdges = template.edges.map((templateEdge: any, idx: number) => ({
            id: `e-${Date.now()}-${idx}`,
            source: idMap[templateEdge.source],
            target: idMap[templateEdge.target],
        }));
        setNodes(newNodes);
        setEdges(newEdges);
    }, [clearFlow, setNodes, setEdges]);

    /** Download a JSON blob as a file */
    const downloadJson = useCallback((data: unknown, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    /**
     * Export in Studio format (default) or n8n format.
     * - Workflow mode: exports StudioDocument (flow only) or n8n JSON
     * - UI mode: exports StudioDocument (ui-layout) with v0.5 metadata
     */
    const handleExport = useCallback((format: 'studio' | 'n8n' = 'studio') => {
        const ts = Date.now();
        if (mode === 'workflow') {
            if (format === 'n8n') {
                // Convert canvas nodes/edges → StudioFlow → n8n workflow JSON
                const studioFlow = legacyFlowToStudioFlow({
                    id: 'current-flow',
                    name: 'Automation Flow',
                    nodes: nodes as any[],
                    edges: edges as any[],
                });
                const n8nWorkflow = toN8nWorkflow(studioFlow);
                downloadJson(n8nWorkflow, `n8n-workflow-${ts}.json`);
            } else {
                exportFlow();
            }
        } else {
            // UI layout export with v0.5 metadata
            const projectSettings = (() => {
                try {
                    return JSON.parse(localStorage.getItem('studio-project-settings') ?? '{}');
                } catch { return {}; }
            })();
            const doc = createStudioDocument('ui-layout', {
                name: projectSettings.name || 'Studio Layout',
                description: projectSettings.description,
                author: projectSettings.author,
            });
            if (doc.ui) {
                doc.ui.version = '0.5';
                doc.ui.root = schema.root ?? [];
                doc.ui.nodes = schema.nodes ?? {};
            }
            downloadJson(doc, `studio-ui-${ts}.json`);
        }
    }, [mode, exportFlow, schema, nodes, edges, downloadJson]);

    /**
     * Import Studio JSON or n8n workflow JSON.
     * Auto-detects format by checking for `nodes`/`connections` (n8n) vs `studioVersion`/`flow`.
     */
    const handleImport = useCallback(() => {
        const processJson = (text: string) => {
            try {
                const parsed = JSON.parse(text);

                if (mode === 'workflow') {
                    // Detect n8n format: has `connections` and `nodes` as array
                    const isN8n = Array.isArray(parsed.nodes) && parsed.connections !== undefined;
                    // Detect Studio unified format
                    const isStudioUnified = parsed.studioVersion && parsed.flow;

                    if (isN8n) {
                        const studioDoc = fromN8nWorkflow(parsed);
                        if (studioDoc.flow) {
                            // Convert StudioFlow back to legacy canvas format for importFlow
                            const legacyJson = JSON.stringify({
                                flow: {
                                    id: studioDoc.metadata.id,
                                    name: studioDoc.metadata.name,
                                    nodes: studioDoc.flow.nodes.map(n => ({
                                        id: n.id,
                                        type: 'automationNode',
                                        position: n.position,
                                        data: { type: n.type, props: n.parameters, label: n.name, category: n.category },
                                    })),
                                    edges: studioDoc.flow.edges.map(e => ({
                                        id: e.id, source: e.source, target: e.target,
                                        data: { order: e.order, label: e.label, condition: e.condition },
                                    })),
                                },
                                exportedAt: new Date().toISOString(),
                            });
                            importFlow(legacyJson);
                        }
                    } else if (isStudioUnified) {
                        const flow = parsed.flow;
                        const legacyJson = JSON.stringify({
                            flow: {
                                id: parsed.metadata?.id ?? 'imported',
                                name: parsed.metadata?.name ?? 'Imported Flow',
                                nodes: flow.nodes.map((n: any) => ({
                                    id: n.id,
                                    type: 'automationNode',
                                    position: n.position,
                                    data: { type: n.type, props: n.parameters, label: n.name, category: n.category },
                                })),
                                edges: flow.edges.map((e: any) => ({
                                    id: e.id, source: e.source, target: e.target,
                                    data: { order: e.order, label: e.label, condition: e.condition },
                                })),
                            },
                            exportedAt: new Date().toISOString(),
                        });
                        importFlow(legacyJson);
                    } else {
                        // Legacy Studio flow format
                        importFlow(text);
                    }
                } else {
                    // UI layout import: accept v0.4/v0.5 or Studio unified doc
                    const uiSchema = parsed.ui ?? parsed;
                    if (uiSchema.root && uiSchema.nodes) {
                        // TODO: wire up parseSchema → setNodes/setEdges for UI
                        alert('UI layout import: schema parsed. Wire-up pending.');
                    } else {
                        alert('Invalid UI layout JSON (missing root/nodes)');
                    }
                }
            } catch {
                alert('Invalid JSON — could not parse file.');
            }
        };

        // Try clipboard paste first, then file picker
        const json = prompt('Paste Studio JSON or n8n workflow JSON:\n(Leave empty to open file picker)');
        if (json && json.trim()) {
            processJson(json);
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                processJson(await file.text());
            };
            input.click();
        }
    }, [mode, importFlow, nodes, edges]);

    const handleClear = useCallback(() => {
        if (confirm('Clear canvas? This cannot be undone.')) {
            if (mode === 'workflow') {
                clearFlow();
            } else {
                clearAll();
            }
        }
    }, [mode, clearFlow, clearAll]);

    // Render canvas based on mode
    // In focus mode, show only the focused group's subtree
    const renderCanvas = () => (
        <div className="h-full flex flex-col">
            {focusedGroupId && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 text-primary border-b border-primary/20 shrink-0">
                    <span>📂 Focus mode — editing group</span>
                    <button
                        className="underline hover:no-underline ml-auto"
                        onClick={exitGroup}
                    >
                        ✕ Exit
                    </button>
                </div>
            )}
            <div className="flex-1 min-h-0">
                <SharedCanvas
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodeSelect={setSelectedNodeId}
                    showLayoutControls={true}
                />
            </div>
        </div>
    );

    // Render preview (UI mode)
    // When a node is pinned OR a group is focused, render its subtree directly
    const pinnedRootId = pinnedIds.length > 0 ? pinnedIds[0] : (focusedGroupId ?? null);

    const renderPreview = () => {
        if (contentTab === 'json') {
            return (
                <pre className="h-full w-full overflow-auto bg-zinc-900 dark:bg-zinc-950 p-4 text-xs text-zinc-100">
                    {JSON.stringify(schema, null, 2)}
                </pre>
            );
        }

        return (
            <CMSPreview
                designMode={previewMode === 'design'}
                onToggleMode={setPreviewMode}
                currentMode={previewMode}
                showSidebar={false}
            >
                {pinnedRootId && (
                    <div className="px-3 py-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                        <span>📌 Pinned preview: node {pinnedRootId.slice(0, 8)}</span>
                        <button
                            className="underline text-amber-700 dark:text-amber-400"
                            onClick={() => unpin(pinnedRootId)}
                        >
                            Unpin
                        </button>
                    </div>
                )}
                <Renderer
                    schema={schema}
                    activeWs={activeWs}
                    onChangeWs={setActiveWs}
                    activeRoute={activeRoute}
                    onNavigate={setActiveRoute}
                    commands={commands}
                    menuOverride={menuOverride}
                    setMenuOverride={setMenuOverride}
                    onSelectNode={previewMode === 'design' ? setSelectedNodeId : () => { }}
                    selectedId={selectedNodeId}
                    designMode={previewMode === 'design'}
                    rootId={pinnedRootId}
                />
            </CMSPreview>
        );
    };

    // Render execution panel (Workflow mode)
    const renderExecutionPanel = () => (
        <ExecutionPanel
            result={result}
            logs={logs}
            steps={steps}
            onClearLogs={clearLogs}
        />
    );

    // Render center content based on mode
    const renderCenter = () => {
        if (mode === 'workflow') {
            return (
                <Card className="h-full overflow-hidden border-0 rounded-none">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                        <ResizablePanel defaultSize={65}>
                            {renderCanvas()}
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={35} minSize={15}>
                            {renderExecutionPanel()}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </Card>
            );
        }

        // UI or Unified mode
        return (
            <Card className="h-full overflow-hidden border-0 rounded-none">
                {layoutTab === 'split' && (
                    <ResizablePanelGroup direction="vertical" className="h-full">
                        <ResizablePanel defaultSize={55}>
                            {renderCanvas()}
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={45}>
                            {mode === 'unified' ? (
                                <ResizablePanelGroup direction="horizontal" className="h-full">
                                    <ResizablePanel defaultSize={60}>
                                        {renderPreview()}
                                    </ResizablePanel>
                                    <ResizableHandle withHandle />
                                    <ResizablePanel defaultSize={40}>
                                        {renderExecutionPanel()}
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            ) : (
                                renderPreview()
                            )}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
                {layoutTab === 'canvas' && (
                    <div className="h-full">{renderCanvas()}</div>
                )}
                {layoutTab === 'preview' && (
                    <div className="h-full">{renderPreview()}</div>
                )}
            </Card>
        );
    };

    const [docsOpen, setDocsOpen] = React.useState(false);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Single-row unified header — all controls in one bar */}
            <StudioGlobalHeader
                mode={mode}
                setMode={setMode}
                layoutTab={layoutTab}
                setLayoutTab={setLayoutTab}
                contentTab={contentTab}
                setContentTab={setContentTab}
                leftTab={leftTab}
                setLeftTab={setLeftTab}
                undo={undo}
                canUndo={canUndo}
                redo={redo}
                canRedo={canRedo}
                handleExport={handleExport}
                handleImport={handleImport}
                handleClear={handleClear}
                onOpenDocs={() => setDocsOpen(true)}
                leftCollapsed={leftCollapsed}
                rightCollapsed={rightCollapsed}
                toggleLeft={() => setLeftCollapsed(v => !v)}
                toggleRight={() => setRightCollapsed(v => !v)}
                onGroup={groupSelectedNodes}
                focusedGroupId={focusedGroupId}
                onExitGroup={exitGroup}
            />
            <div className="flex-1 min-h-0">
                <ThreeColumnLayoutAdvanced
                    preset="ide"
                    leftCollapsed={leftCollapsed}
                    rightCollapsed={rightCollapsed}
                    onLeftCollapsedChange={setLeftCollapsed}
                    onRightCollapsedChange={setRightCollapsed}
                    /* No per-column headers — all controls are in the single top bar */
                    left={
                        <StudioLeftPanel
                            mode={mode}
                            leftTab={leftTab}
                            setLeftTab={setLeftTab}
                            onAddComponent={handleAddComponent}
                            onImportTemplate={handleImportTemplate}
                        />
                    }
                    center={renderCenter()}
                    right={
                        <StudioRightPanel
                            mode={mode}
                            selectedNodeId={selectedNodeId}
                            isPinned={isPinned}
                            pin={pin}
                            unpin={unpin}
                            removeSelectedNode={removeSelectedNode}
                        />
                    }
                    rightWidth={280}
                    persistState={true}
                    storageKey="studio-layout"
                    showCollapseButtons={false}
                />
            </div>
            {docsOpen && (
                <React.Suspense fallback={null}>
                    <StudioDocsDialog open={docsOpen} onClose={() => setDocsOpen(false)} />
                </React.Suspense>
            )}
        </div>
    );
};

// ============================================================================
// Exports
// ============================================================================

export interface StudioPageProps {
    workspaceId?: Id<"workspaces">;
}

export const StudioPage: React.FC<StudioPageProps> = ({ workspaceId }) => {
    const { registerComponent, registerFeatureTabs } = useCrossFeatureRegistry();

    useEffect(() => {
        registerStudioComponents(registerComponent);
        registerStudioLibraryTabs(registerFeatureTabs);
    }, [registerComponent, registerFeatureTabs]);

    return (
        <SharedCanvasProvider initialMode="studio">
            <DnDProvider>
                <StudioLayoutInner workspaceId={workspaceId} />
            </DnDProvider>
        </SharedCanvasProvider>
    );
};

export default StudioPage;
