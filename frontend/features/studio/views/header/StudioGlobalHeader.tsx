/**
 * Studio Global Header — Single Row Toolbar
 *
 * Combines ALL Studio controls into one compact row:
 * Left:   Mode toggle (UI / Flow / All)
 * Center: Layout view (split/canvas/preview) + preview/code toggle + panel tabs
 * Right:  Undo/Redo | Export/Import/Docs/Clear
 */
import React from 'react';
import { Layers3, Zap, Layout, BookOpen, Settings2, Undo2, Redo2, Download, Upload, Eraser, BookMarked, Eye, Code, PanelLeft, PanelRight, Group, Ungroup, ArrowRightLeft } from 'lucide-react';
import { FeatureHeader } from '@/frontend/shared/ui/layout/header';
import { Button } from '@/components/ui';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { StudioMode } from '@/frontend/features/studio/registry';

interface StudioGlobalHeaderProps {
    mode: StudioMode;
    setMode: (mode: StudioMode) => void;
    layoutTab: 'split' | 'canvas' | 'preview';
    setLayoutTab: (t: 'split' | 'canvas' | 'preview') => void;
    contentTab: 'preview' | 'json';
    setContentTab: (t: 'preview' | 'json') => void;
    leftTab: 'library' | 'templates' | 'settings';
    setLeftTab: (t: 'library' | 'templates' | 'settings') => void;
    undo: () => void;
    canUndo: boolean;
    redo: () => void;
    canRedo: boolean;
    handleExport: (format?: 'studio' | 'n8n') => void;
    handleImport: () => void;
    handleClear: () => void;
    onOpenDocs: () => void;
    onOpenConverter: () => void;
    // Panel collapse — managed in StudioPage (outside ThreeColumnLayoutAdvanced context)
    leftCollapsed: boolean;
    rightCollapsed: boolean;
    toggleLeft: () => void;
    toggleRight: () => void;
    // Group operations
    onGroup: () => void;
    focusedGroupId: string | null;
    onExitGroup: () => void;
}

const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Tooltip>
        <TooltipTrigger asChild>{children as any}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
);

const Sep = () => <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;

const ToggleBtn = ({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) => (
    <Tip label={title}>
        <Button
            variant={active ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onClick}
            className="h-7 w-7 p-0 shrink-0"
        >
            {children}
        </Button>
    </Tip>
);

export const StudioGlobalHeader: React.FC<StudioGlobalHeaderProps> = ({
    mode, setMode,
    layoutTab, setLayoutTab,
    contentTab, setContentTab,
    leftTab, setLeftTab,
    undo, canUndo, redo, canRedo,
    handleExport, handleImport, handleClear, onOpenDocs, onOpenConverter,
    leftCollapsed, rightCollapsed, toggleLeft, toggleRight,
    onGroup, focusedGroupId, onExitGroup,
}) => {

    const toolbar = (
        <TooltipProvider delayDuration={400}>
            <div className="flex items-center gap-1 flex-1 overflow-hidden">

                {/* ── Mode Toggle ─────────────────────────────── */}
                <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                    <Tip label="UI Builder">
                        <Button variant={mode === 'ui' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('ui')} className="h-6 px-2 text-xs gap-1">
                            <Layers3 size={12} /> UI
                        </Button>
                    </Tip>
                    <Tip label="Workflow / Automation">
                        <Button variant={mode === 'workflow' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('workflow')} className="h-6 px-2 text-xs gap-1">
                            <Zap size={12} /> Flow
                        </Button>
                    </Tip>
                    <Tip label="Unified (UI + Flow)">
                        <Button variant={mode === 'unified' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('unified')} className="h-6 px-2 text-xs gap-1">
                            <Layers3 size={12} /> All
                        </Button>
                    </Tip>
                </div>

                <Sep />

                {/* ── Canvas Layout (only in UI/unified mode) ── */}
                {(mode === 'ui' || mode === 'unified') && (
                    <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                        <ToggleBtn active={layoutTab === 'split'} onClick={() => setLayoutTab('split')} title="Split (Canvas + Preview)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 12h18" /></svg>
                        </ToggleBtn>
                        <ToggleBtn active={layoutTab === 'canvas'} onClick={() => setLayoutTab('canvas')} title="Canvas Only">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
                        </ToggleBtn>
                        <ToggleBtn active={layoutTab === 'preview'} onClick={() => setLayoutTab('preview')} title="Preview Only">
                            <Eye size={12} />
                        </ToggleBtn>
                    </div>
                )}

                {/* ── Preview/JSON Toggle ───────────────────── */}
                <div className="flex items-center bg-muted rounded-md p-0.5 shrink-0">
                    <ToggleBtn active={contentTab === 'preview'} onClick={() => setContentTab('preview')} title="Visual Preview">
                        <Eye size={12} />
                    </ToggleBtn>
                    <ToggleBtn active={contentTab === 'json'} onClick={() => setContentTab('json')} title="JSON Schema View">
                        <Code size={12} />
                    </ToggleBtn>
                </div>

                <Sep />

                {/* ── Left Panel Tab Switcher ───────────────── */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <ToggleBtn active={leftTab === 'library'} onClick={() => setLeftTab('library')} title="Component Library">
                        <Layout size={12} />
                    </ToggleBtn>
                    <ToggleBtn active={leftTab === 'templates'} onClick={() => setLeftTab('templates')} title="Templates">
                        <BookOpen size={12} />
                    </ToggleBtn>
                    <ToggleBtn active={leftTab === 'settings'} onClick={() => setLeftTab('settings')} title="Project Settings">
                        <Settings2 size={12} />
                    </ToggleBtn>
                </div>

                <Sep />

                {/* ── Panel collapse shortcuts ─────────────── */}
                <Tip label={leftCollapsed ? 'Show Library' : 'Hide Library'}>
                    <Button variant="ghost" size="sm" onClick={toggleLeft} className="h-7 w-7 p-0 shrink-0">
                        <PanelLeft size={12} />
                    </Button>
                </Tip>
                <Tip label={rightCollapsed ? 'Show Inspector' : 'Hide Inspector'}>
                    <Button variant="ghost" size="sm" onClick={toggleRight} className="h-7 w-7 p-0 shrink-0">
                        <PanelRight size={12} />
                    </Button>
                </Tip>
                <Sep />

                {/* ── Group controls ───────────────────────────── */}
                <Tip label="Group selected nodes (G)">
                    <Button variant="ghost" size="sm" onClick={onGroup} className="h-7 w-7 p-0 shrink-0">
                        <Group size={12} />
                    </Button>
                </Tip>
                {focusedGroupId && (
                    <button
                        onClick={onExitGroup}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                        title="Exit group focus mode"
                    >
                        <Ungroup size={10} />
                        Exit Group
                    </button>
                )}
                <Sep />
            </div>
        </TooltipProvider>
    );

    const actions = (
        <TooltipProvider delayDuration={400}>
            <div className="flex items-center gap-0.5 shrink-0">
                <Tip label="Undo (Ctrl+Z)">
                    <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-7 w-7 p-0">
                        <Undo2 size={13} />
                    </Button>
                </Tip>
                <Tip label="Redo (Ctrl+Shift+Z)">
                    <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-7 w-7 p-0">
                        <Redo2 size={13} />
                    </Button>
                </Tip>
                <Sep />
                <Tip label="Export Studio JSON">
                    <Button variant="ghost" size="sm" onClick={() => handleExport('studio')} className="h-7 w-7 p-0">
                        <Download size={13} />
                    </Button>
                </Tip>
                <Tip label="Export as n8n workflow JSON">
                    <Button variant="ghost" size="sm" onClick={() => handleExport('n8n')} className="h-7 px-1.5 text-[10px] gap-1 font-mono text-muted-foreground hover:text-foreground">
                        n8n
                    </Button>
                </Tip>
                <Tip label="Import JSON (Studio or n8n format)">
                    <Button variant="ghost" size="sm" onClick={handleImport} className="h-7 w-7 p-0">
                        <Upload size={13} />
                    </Button>
                </Tip>
                <Tip label="JSON Schema Docs">
                    <Button variant="ghost" size="sm" onClick={onOpenDocs} className="h-7 w-7 p-0">
                        <BookMarked size={13} />
                    </Button>
                </Tip>
                <Tip label="Convert JSON ↔ HTML / TSX">
                    <Button variant="ghost" size="sm" onClick={onOpenConverter} className="h-7 w-7 p-0">
                        <ArrowRightLeft size={13} />
                    </Button>
                </Tip>
                <Sep />
                <Tip label="Clear Canvas">
                    <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                        <Eraser size={13} />
                    </Button>
                </Tip>
            </div>
        </TooltipProvider>
    );

    return (
        <FeatureHeader
            title="Studio"
            icon={Layers3}
            toolbar={toolbar}
            secondaryActions={actions}
        />
    );
};
