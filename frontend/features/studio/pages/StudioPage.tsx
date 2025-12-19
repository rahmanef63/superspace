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

// Node types from both features
import { ShadcnNode } from '@/frontend/features/studio/ui/slices/canvas/components/ShadcnNode';
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

import { StudioLeftHeader } from '../views/header/StudioLeftHeader';
import { StudioCenterHeader } from '../views/header/StudioCenterHeader';
import { StudioRightHeader } from '../views/header/StudioRightHeader';
import { StudioGlobalHeader } from '../views/header/StudioGlobalHeader';
import { StudioLeftPanel } from '../views/StudioLeftPanel';
import { StudioRightPanel } from '../views/StudioRightPanel';

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

    const handleExport = useCallback(() => {
        if (mode === 'workflow') {
            exportFlow();
        } else {
            const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'studio-export.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [mode, exportFlow, schema]);

    const handleImport = useCallback(() => {
        if (mode === 'workflow') {
            const json = prompt('Paste workflow JSON:');
            if (json) importFlow(json);
        } else {
            // File input for UI import
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                    const parsed = JSON.parse(text);
                    // TODO: parseSchema from builder
                } catch {
                    alert('Invalid JSON');
                }
            };
            input.click();
        }
    }, [mode, importFlow]);

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
    const renderCanvas = () => (
        <SharedCanvas
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeSelect={setSelectedNodeId}
            showLayoutControls={true}
        />
    );

    // Render preview (UI mode)
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

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <StudioGlobalHeader
                mode={mode}
                setMode={setMode}
                undo={undo}
                canUndo={canUndo}
                redo={redo}
                canRedo={canRedo}
                handleExport={handleExport}
                handleImport={handleImport}
                handleClear={handleClear}
            />
            <div className="flex-1 min-h-0">
                <ThreeColumnLayoutAdvanced
                    preset="ide"
                    leftHeader={<StudioLeftHeader />}
                    centerHeader={
                        <StudioCenterHeader
                            mode={mode}
                            layoutTab={layoutTab}
                            setLayoutTab={setLayoutTab}
                            contentTab={contentTab}
                            setContentTab={setContentTab}
                        />
                    }
                    rightHeader={<StudioRightHeader />}
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
