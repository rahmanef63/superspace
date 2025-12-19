import React from 'react';
import { Card, Button, Input, Label } from '@/components/ui';
import { Layout, BookOpen, Settings } from 'lucide-react';
import { UnifiedLibrary } from '@/frontend/shared/builder';
import { TemplatesGallery } from '@/frontend/features/studio/components/TemplatesGallery';
import { TemplateLibrary } from '@/frontend/shared/builder';
import { cmsTemplateProvider } from '@/frontend/features/studio/ui/state/templateProvider';
import type { StudioMode } from '@/frontend/features/studio/registry';

interface LeftPanelProps {
    mode: StudioMode;
    leftTab: 'library' | 'templates' | 'settings';
    setLeftTab: (t: 'library' | 'templates' | 'settings') => void;
    onAddComponent: (compKey: string) => void;
    onImportTemplate: (template: any) => void;
}

export const StudioLeftPanel: React.FC<LeftPanelProps> = ({
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
