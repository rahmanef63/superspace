/**
 * Studio Preview Page — Full-screen standalone preview
 *
 * Opens as a new browser tab with the current canvas schema.
 * Schema is passed via localStorage key 'studio-preview-schema'.
 */
"use client";

import React, { useEffect, useState } from 'react';
import { Renderer } from '@/frontend/features/studio/ui/slices/renderer/components/Renderer';
import type { Schema } from '@/frontend/features/studio/ui/types';
import { X, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'studio-preview-schema';

export default function StudioPreviewPage() {
    const [schema, setSchema] = useState<Schema | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadSchema = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                setError('No preview schema found. Open the Studio and click "Open Preview in New Tab".');
                return;
            }
            const parsed = JSON.parse(raw);
            setSchema(parsed);
            setError(null);
        } catch (e: any) {
            setError('Failed to parse schema: ' + e.message);
        }
    };

    useEffect(() => {
        loadSchema();

        // Listen for schema updates (when Studio saves a new version)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) loadSchema();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-8">
                <div className="text-4xl">🎨</div>
                <p className="text-muted-foreground text-sm text-center max-w-sm">{error}</p>
                <button
                    onClick={loadSchema}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-sm text-muted-foreground">Loading preview…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative">
            {/* Floating toolbar */}
            <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-background/90 backdrop-blur border border-border rounded-xl shadow-lg px-2.5 py-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">Studio Preview</span>
                <button
                    onClick={loadSchema}
                    title="Reload schema from Studio"
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RefreshCw size={12} />
                </button>
                <button
                    onClick={() => window.close()}
                    title="Close preview"
                    className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                    <X size={12} />
                </button>
            </div>

            <Renderer
                schema={schema}
                activeWs={{ category: 'personal', key: '' }}
                onChangeWs={() => { }}
                activeRoute="/"
                onNavigate={() => { }}
                commands={{ newWorkspace: () => { }, newMenu: () => { }, newPage: () => { } }}
                menuOverride={null}
                setMenuOverride={() => { }}
                onSelectNode={() => { }}
                selectedId={null}
                designMode={false}
            />
        </div>
    );
}
