import React from 'react';
import { Button } from '@/components/ui';
import { Layers3, Zap } from 'lucide-react';
import type { StudioMode } from '@/frontend/features/studio/registry';

export const StudioModeToggle = ({ mode, setMode }: { mode: StudioMode; setMode: (m: StudioMode) => void }) => (
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
