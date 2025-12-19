import React from 'react';
import { Button } from '@/components/ui';
import { Eye, Code } from 'lucide-react';
import type { StudioMode } from '@/frontend/features/studio/registry';

export const StudioCenterHeader = ({
    mode,
    layoutTab,
    setLayoutTab,
    contentTab,
    setContentTab
}: {
    mode: StudioMode,
    layoutTab: 'split' | 'canvas' | 'preview',
    setLayoutTab: (t: 'split' | 'canvas' | 'preview') => void,
    contentTab: 'preview' | 'json',
    setContentTab: (t: 'preview' | 'json') => void
}) => {
    return (
        <div className="flex items-center justify-between w-full px-1">
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
        </div>
    );
};
