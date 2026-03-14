import React, { useState, useEffect } from 'react';
import { Card, Input, Label, Button, Textarea } from '@/components/ui';
import { Save, FolderOpen } from 'lucide-react';
import { UnifiedLibrary } from '@/frontend/shared/builder';
import { TemplatesGallery } from '@/frontend/features/studio/components/TemplatesGallery';
import { TemplateLibrary } from '@/frontend/shared/builder';
import { cmsTemplateProvider } from '@/frontend/features/studio/ui/state/templateProvider';
import { saveAssetTemplate } from '@/frontend/features/studio/ui/state/templateStore';
import { useSharedCanvas } from '@/frontend/shared/builder';
import { toSchema } from '@/frontend/features/studio/ui/hooks/useSchema';
import type { StudioMode } from '@/frontend/features/studio/registry';
import { STUDIO_TAB_ICONS } from '@/frontend/features/studio/registry/studioLibraryTabs';

const SETTINGS_KEY = 'studio-project-settings';

interface ProjectSettings {
    name: string;
    description: string;
    author: string;
}

function useProjectSettings() {
    const [settings, setSettings] = useState<ProjectSettings>(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : { name: 'My Project', description: '', author: '' };
        } catch {
            return { name: 'My Project', description: '', author: '' };
        }
    });

    const save = (next: ProjectSettings) => {
        setSettings(next);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    };

    return { settings, save };
}

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
    const { settings, save } = useProjectSettings();
    const { nodes, edges } = useSharedCanvas();
    const [saved, setSaved] = useState(false);

    const handleSaveTemplate = () => {
        const schema = toSchema(nodes as any, edges as any);
        saveAssetTemplate(settings.name || 'My Project', schema);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
            <div className="flex-1 overflow-hidden">
                {leftTab === 'library' && (
                    <div className="h-full">
                        <UnifiedLibrary currentFeature="studio" onAdd={onAddComponent} tabIcons={STUDIO_TAB_ICONS} />
                    </div>
                )}
                {leftTab === 'templates' && (
                    <div className="h-full">
                        {mode === 'workflow' ? (
                            <TemplatesGallery onImport={onImportTemplate} />
                        ) : (
                            <TemplateLibrary onOpen={(schema) => onImportTemplate(schema)} templateProvider={cmsTemplateProvider} />
                        )}
                    </div>
                )}
                {leftTab === 'settings' && (
                    <div className="h-full overflow-auto p-3 space-y-4">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Project Settings
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs">Project Name</Label>
                                <Input
                                    value={settings.name}
                                    onChange={e => save({ ...settings, name: e.target.value })}
                                    placeholder="My Project"
                                    className="mt-1 h-8"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Description</Label>
                                <textarea
                                    value={settings.description}
                                    onChange={e => save({ ...settings, description: e.target.value })}
                                    placeholder="Project description..."
                                    className="mt-1 w-full min-h-[60px] px-2.5 py-1.5 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Author</Label>
                                <Input
                                    value={settings.author}
                                    onChange={e => save({ ...settings, author: e.target.value })}
                                    placeholder="Your name..."
                                    className="mt-1 h-8"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-3 space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Canvas
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 text-xs"
                                onClick={handleSaveTemplate}
                            >
                                <Save size={12} />
                                {saved ? 'Saved!' : 'Save as Template'}
                            </Button>
                            <p className="text-[10px] text-muted-foreground">
                                Saves current canvas to the Templates library under project name.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
