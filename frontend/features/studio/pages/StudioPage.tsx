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
import {
    Layout,
    Settings,
    Trash2,
    Pin,
    PinOff,
    Play,
    Pause,
    CheckCircle2,
    FileJson2,
    Upload,
    Download,
    RotateCcw,
    Zap,
    Layers3,
    Eye,
    Code,
    BookOpen,
    Eraser,
    Undo2,
    Redo2,
    Copy,
    Scissors,
    ClipboardPaste,
} from 'lucide-react';

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

const TopBarButton = ({ children, onClick, disabled, title }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
}) => (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} title={title} className="h-8 w-8 p-0">
        {children}
    </Button>
);

const ModeToggle = ({ mode, setMode }: { mode: StudioMode; setMode: (m: StudioMode) => void }) => (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
        <Button
            variant={mode === 'ui' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('ui')}
            className="h-7 px-3 text-xs"
            title="UI Builder Mode"
        >
            <Layers3 size={14} className="mr-1" />
            UI
        </Button>
        <Button
            variant={mode === 'workflow' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('workflow')}
            className="h-7 px-3 text-xs"
            title="Workflow Mode"
        >
            <Zap size={14} className="mr-1" />
            Flow
        </Button>
        <Button
            variant={mode === 'unified' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('unified')}
            className="h-7 px-3 text-xs"
            title="Unified Mode (All)"
        >
            <Layers3 size={14} className="mr-1" />
            All
        </Button>
    </div>
);

// ============================================================================
// Left Panel - Unified Library
// ============================================================================

interface LeftPanelProps {
    mode: StudioMode;
    leftTab: 'library' | 'templates' | 'settings';
    setLeftTab: (t: 'library' | 'templates' | 'settings') => void;
    onAddComponent: (compKey: string) => void;
    onImportTemplate: (template: any) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
    mode,
    leftTab,
    setLeftTab,
    onAddComponent,
    onImportTemplate,
}) => {
    return (
        <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
            {/* Compact icon-only header for panel switching */}
            <div className="px-2 py-1.5 border-b flex items-center justify-end gap-1">
                <Button
                    variant={leftTab === 'library' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setLeftTab('library')}
                    title="Components"
                >
                    <Layout size={14} />
                </Button>
                <Button
                    variant={leftTab === 'templates' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setLeftTab('templates')}
                    title="Templates"
                >
                    <BookOpen size={14} />
                </Button>
                <Button
                    variant={leftTab === 'settings' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setLeftTab('settings')}
                    title="Settings"
                >
                    <Settings size={14} />
                </Button>
            </div>
            <div className="flex-1 overflow-hidden">
                {leftTab === 'library' && (
                    <div className="h-full">
                        <UnifiedLibrary currentFeature="studio" onAdd={onAddComponent} />
                    </div>
                )}
                {leftTab === 'templates' && (
                    <div className="h-full">
                        {mode === 'workflow' ? (
                            <TemplatesGallery onImport={onImportTemplate} />
                        ) : (
                            <TemplateLibrary onOpen={() => { }} templateProvider={cmsTemplateProvider} />
                        )}
                    </div>
                )}
                {leftTab === 'settings' && (
                    <div className="h-full p-3 space-y-4 overflow-auto">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Project Settings
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs">Project Name</Label>
                                <Input placeholder="My Project" className="mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs">Description</Label>
                                <Input placeholder="Project description..." className="mt-1" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

// ============================================================================
// Right Panel - Context-Aware Inspector
// ============================================================================

interface RightPanelProps {
    mode: StudioMode;
    selectedNodeId: string | null;
    isPinned: (id: string) => boolean;
    pin: (id: string) => void;
    unpin: (id: string) => void;
    removeSelectedNode: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
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

// ============================================================================
// Top Bar
// ============================================================================

interface TopBarProps {
    mode: StudioMode;
    setMode: (m: StudioMode) => void;
    layoutTab: 'split' | 'canvas' | 'preview';
    setLayoutTab: (t: 'split' | 'canvas' | 'preview') => void;
    contentTab: 'preview' | 'json';
    setContentTab: (t: 'preview' | 'json') => void;
    // Workflow controls
    status: string;
    onValidate: () => void;
    onRun: () => void;
    onStop: () => void;
    // Common controls
    onExport: () => void;
    onImport: () => void;
    onClear: () => void;
    // History
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
    mode,
    setMode,
    layoutTab,
    setLayoutTab,
    contentTab,
    setContentTab,
    status,
    onValidate,
    onRun,
    onStop,
    onExport,
    onImport,
    onClear,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}) => {
    const isRunning = status === 'running' || status === 'validating';
    const showWorkflowControls = mode === 'workflow' || mode === 'unified';
    const showUIControls = mode === 'ui' || mode === 'unified';

    return (
        <div className="flex-shrink-0 flex items-center justify-between border-b border-border bg-background/95 px-3 py-1.5 backdrop-blur z-10">
            {/* Left: Logo & Mode */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Layers3 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">Studio</span>
                </div>
                <ModeToggle mode={mode} setMode={setMode} />
            </div>

            {/* Center: View Controls */}
            <div className="flex items-center gap-2">
                {/* Layout Toggle (compact icon buttons) */}
                {showUIControls && (
                    <div className="flex items-center bg-muted rounded-md p-0.5">
                        <Button
                            variant={layoutTab === 'split' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setLayoutTab('split')}
                            className="h-7 w-7 p-0"
                            title="Split View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 12h18" /></svg>
                        </Button>
                        <Button
                            variant={layoutTab === 'canvas' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setLayoutTab('canvas')}
                            className="h-7 w-7 p-0"
                            title="Canvas Only"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /></svg>
                        </Button>
                        <Button
                            variant={layoutTab === 'preview' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setLayoutTab('preview')}
                            className="h-7 w-7 p-0"
                            title="Preview Only"
                        >
                            <Eye size={14} />
                        </Button>
                    </div>
                )}

                {/* View/Code Toggle */}
                <div className="flex items-center bg-muted rounded-md p-0.5">
                    <Button
                        variant={contentTab === 'preview' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setContentTab('preview')}
                        className="h-7 w-7 p-0"
                        title="Visual Preview"
                    >
                        <Eye size={14} />
                    </Button>
                    <Button
                        variant={contentTab === 'json' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setContentTab('json')}
                        className="h-7 w-7 p-0"
                        title="JSON View"
                    >
                        <Code size={14} />
                    </Button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* History */}
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-7 w-7 p-0" title="Undo">
                        <Undo2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="h-7 w-7 p-0" title="Redo">
                        <Redo2 size={14} />
                    </Button>
                </div>

                <div className="w-px h-5 bg-border" />

                {/* File Actions */}
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={onExport} disabled={isRunning} className="h-7 w-7 p-0" title="Export">
                        <Download size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onImport} disabled={isRunning} className="h-7 w-7 p-0" title="Import">
                        <Upload size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClear} className="h-7 w-7 p-0" title="Clear Canvas">
                        <Eraser size={14} />
                    </Button>
                </div>

                {/* Workflow Actions */}
                {showWorkflowControls && (
                    <>
                        <div className="w-px h-5 bg-border" />
                        <div className="flex items-center gap-1.5">
                            <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${status === 'success' ? 'bg-green-500/10 text-green-600' :
                                status === 'failed' ? 'bg-red-500/10 text-red-600' :
                                    status === 'running' ? 'bg-blue-500/10 text-blue-600' :
                                        'bg-muted text-muted-foreground'
                                }`}>
                                {status === 'idle' ? 'Draft' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                            <Button variant="outline" size="sm" onClick={onValidate} disabled={isRunning} className="h-7 text-xs px-2">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Validate
                            </Button>
                            {isRunning ? (
                                <Button variant="destructive" size="sm" onClick={onStop} className="h-7 text-xs px-2">
                                    <Pause className="w-3 h-3 mr-1" />
                                    Stop
                                </Button>
                            ) : (
                                <Button size="sm" onClick={onRun} className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700">
                                    <Play className="w-3 h-3 mr-1" />
                                    Run
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

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
        <ThreeColumnLayoutAdvanced
            preset="ide"
            leftHeader={
                <div className="flex items-center gap-2 px-2">
                    <Layers3 className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Studio</span>
                    <ModeToggle mode={mode} setMode={setMode} />
                </div>
            }
            centerHeader={
                <div className="flex items-center gap-2">
                    {/* Layout Toggle */}
                    {(mode === 'ui' || mode === 'unified') && (
                        <div className="flex items-center bg-muted rounded-md p-0.5">
                            <Button variant={layoutTab === 'split' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLayoutTab('split')} className="h-7 w-7 p-0" title="Split View">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 12h18" /></svg>
                            </Button>
                            <Button variant={layoutTab === 'canvas' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLayoutTab('canvas')} className="h-7 w-7 p-0" title="Canvas Only">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /></svg>
                            </Button>
                            <Button variant={layoutTab === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLayoutTab('preview')} className="h-7 w-7 p-0" title="Preview Only">
                                <Eye size={14} />
                            </Button>
                        </div>
                    )}
                    {/* Preview/JSON Toggle */}
                    <div className="flex items-center bg-muted rounded-md p-0.5">
                        <Button variant={contentTab === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setContentTab('preview')} className="h-7 w-7 p-0" title="Visual Preview">
                            <Eye size={14} />
                        </Button>
                        <Button variant={contentTab === 'json' ? 'secondary' : 'ghost'} size="sm" onClick={() => setContentTab('json')} className="h-7 w-7 p-0" title="JSON View">
                            <Code size={14} />
                        </Button>
                    </div>
                </div>
            }
            rightHeader={
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-7 w-7 p-0" title="Undo"><Undo2 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-7 w-7 p-0" title="Redo"><Redo2 size={14} /></Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={handleExport} className="h-7 w-7 p-0" title="Export"><Download size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={handleImport} className="h-7 w-7 p-0" title="Import"><Upload size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 w-7 p-0" title="Clear"><Eraser size={14} /></Button>
                </div>
            }
            left={
                <LeftPanel
                    mode={mode}
                    leftTab={leftTab}
                    setLeftTab={setLeftTab}
                    onAddComponent={handleAddComponent}
                    onImportTemplate={handleImportTemplate}
                />
            }
            center={renderCenter()}
            right={
                <RightPanel
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
