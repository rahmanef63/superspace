import React from 'react';
import { Layers } from 'lucide-react';
import { FeatureHeader } from '@/frontend/shared/ui/layout/header';
import { StudioModeToggle } from '../StudioModeToggle';
import { Button } from '@/components/ui';
import { Undo2, Redo2, Download, Upload, Eraser } from 'lucide-react';
import type { StudioMode } from '@/frontend/features/studio/registry';

interface StudioGlobalHeaderProps {
    mode: StudioMode;
    setMode: (mode: StudioMode) => void;
    undo: () => void;
    canUndo: boolean;
    redo: () => void;
    canRedo: boolean;
    handleExport: () => void;
    handleImport: () => void;
    handleClear: () => void;
}

export const StudioGlobalHeader: React.FC<StudioGlobalHeaderProps> = ({
    mode,
    setMode,
    undo,
    canUndo,
    redo,
    canRedo,
    handleExport,
    handleImport,
    handleClear,
}) => {
    // Defines the toolbar content (Center)
    const toolbar = (
        <div className="flex items-center gap-2">
            <StudioModeToggle mode={mode} setMode={setMode} />
        </div>
    );

    // Defines the actions (Right)
    const actions = (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} className="h-7 w-7 p-0" title="Undo">
                <Undo2 size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} className="h-7 w-7 p-0" title="Redo">
                <Redo2 size={14} />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={handleExport} className="h-7 w-7 p-0" title="Export">
                <Download size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleImport} className="h-7 w-7 p-0" title="Import">
                <Upload size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 w-7 p-0" title="Clear">
                <Eraser size={14} />
            </Button>
        </div>
    );

    return (
        <FeatureHeader
            title="Studio"
            icon={Layers}
            toolbar={toolbar}
            secondaryActions={actions}
        />
    );
};
