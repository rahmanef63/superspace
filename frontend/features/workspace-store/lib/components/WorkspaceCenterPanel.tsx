/**
 * Workspace Center Panel Component
 * 
 * Dynamic content panel based on selected mode (inspector, features, available, settings, import)
 */

"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Check, Sliders } from "lucide-react"
import { ContainerHeader } from "@/frontend/shared/ui/layout/header"
import { FeatureListPanel } from "@/frontend/shared/preview"
import { FeatureSettingsListPanel } from "@/frontend/shared/settings/components/FeatureSettingsListPanel"
import { WorkspaceInspector } from "../../components"
import { WorkspacePanelTabs } from "./WorkspacePanelTabs"
import { WorkspaceTemplateCard } from "./WorkspaceTemplateCard"
import { getPanelTitle, getPanelSubtitle, getPanelIcon, type PanelMode, type PanelContext } from "@/lib/utils/panel-config"
import { getAvailableTemplates, type WorkspaceTemplate } from "@/lib/utils/workspace-store"
import type { WorkspaceStoreItem } from "../../types"
import type { FeaturePreviewConfig } from "@/frontend/shared/preview"

export interface WorkspaceCenterPanelProps {
    mode: PanelMode
    selectedWorkspace: WorkspaceStoreItem | null
    featurePreviews: FeaturePreviewConfig[]
    selectedFeatureId: string | null
    previewVisible: boolean
    selectedSettingsSlug: string | null
    settingsVisible: boolean
    workspaceMenuItems?: Array<{ slug: string; name: string; isVisible: boolean }>
    importWorkspaceId: string
    importing: boolean
    isLoadingPreviews: boolean
    onModeChange: (mode: PanelMode) => void
    onTogglePreview: (featureId: string) => void
    onToggleSettings: (featureSlug: string, featureName?: string) => void
    onInspectorUpdate: (workspaceId: string, data: Partial<WorkspaceStoreItem>) => Promise<void>
    onShowFeatures: () => void
    onUseTemplate: (template: WorkspaceTemplate) => void
    onImportWorkspaceIdChange: (id: string) => void
    onImportWorkspace: () => void
}

export function WorkspaceCenterPanel({
    mode,
    selectedWorkspace,
    featurePreviews,
    selectedFeatureId,
    previewVisible,
    selectedSettingsSlug,
    settingsVisible,
    workspaceMenuItems,
    importWorkspaceId,
    importing,
    isLoadingPreviews,
    onModeChange,
    onTogglePreview,
    onToggleSettings,
    onInspectorUpdate,
    onShowFeatures,
    onUseTemplate,
    onImportWorkspaceIdChange,
    onImportWorkspace
}: WorkspaceCenterPanelProps) {
    const templates = getAvailableTemplates()

    const context: PanelContext = {
        selectedWorkspace,
        featureCount: featurePreviews.length,
        templateCount: templates.length
    }

    const title = getPanelTitle(mode)
    const subtitle = getPanelSubtitle(mode, context)
    const Icon = getPanelIcon(mode)

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Panel Header with Tabs - Hidden on mobile when embedded */}
            <div className="flex-shrink-0 border-b bg-muted/30 hidden md:block">
                <ContainerHeader
                    title={title}
                    subtitle={subtitle}
                    icon={Icon}
                />
                <WorkspacePanelTabs
                    mode={mode}
                    onModeChange={onModeChange}
                    selectedWorkspace={selectedWorkspace}
                />
            </div>

            {/* Panel Content with mobile padding */}
            <div className="flex-1 min-h-0 overflow-auto">
                {/* Inspector Tab */}
                {mode === "inspector" && (
                    <div className="p-4">
                        <WorkspaceInspector
                            workspace={selectedWorkspace}
                            onUpdate={onInspectorUpdate}
                            onShowFeatures={onShowFeatures}
                        />
                    </div>
                )}

                {/* Features Tab */}
                {mode === "features" && (
                    <div className="p-3 md:p-0">
                        <FeatureListPanel
                            features={featurePreviews}
                            selectedFeatureId={selectedFeatureId}
                            onTogglePreview={onTogglePreview}
                            previewVisibleFor={previewVisible ? selectedFeatureId : null}
                            isLoading={isLoadingPreviews}
                            hideHeader
                        />
                    </div>
                )}

                {/* Available Templates Tab */}
                {mode === "available" && (
                    <div className="p-3 md:p-4">
                        {templates.length > 0 ? (
                            <div className="grid gap-3 md:gap-4 grid-cols-1">
                                {templates.map((template) => (
                                    <WorkspaceTemplateCard
                                        key={template.id}
                                        template={template}
                                        onUseTemplate={onUseTemplate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center px-4">
                                <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
                                <h3 className="mb-2 text-lg font-semibold">All Templates Used</h3>
                                <p className="text-muted-foreground text-sm">
                                    You have used all available workspace templates.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {mode === "settings" && (
                    <div className="h-full">
                        {selectedWorkspace ? (
                            <div className="p-3 md:p-0">
                                <FeatureSettingsListPanel
                                    menuItems={workspaceMenuItems as any[] ?? []}
                                    onToggleSettings={onToggleSettings}
                                    activeSettingsSlug={settingsVisible ? selectedSettingsSlug : null}
                                    searchable
                                    showCounts
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center animate-in fade-in-50 duration-500">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 md:mb-6 ring-1 ring-border/50">
                                    <Sliders className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="font-semibold text-lg md:text-xl tracking-tight mb-2">Select a Workspace</h3>
                                <p className="text-muted-foreground max-w-xs text-xs md:text-sm leading-relaxed">
                                    Choose a workspace from the tree to view and configure its feature settings.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Import Tab */}
                {mode === "import" && (
                    <div className="p-3 md:p-4">
                        <div className="space-y-4 md:space-y-6">
                            <div className="w-full md:max-w-md space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="workspaceId" className="text-sm">Workspace ID</Label>
                                    <Input
                                        id="workspaceId"
                                        placeholder="Enter shareable workspace ID..."
                                        value={importWorkspaceId}
                                        onChange={(e) => onImportWorkspaceIdChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && importWorkspaceId.trim() && !importing) {
                                                onImportWorkspace()
                                            }
                                        }}
                                        className="text-sm"
                                    />
                                </div>
                                <Button
                                    onClick={onImportWorkspace}
                                    disabled={!importWorkspaceId.trim() || importing}
                                    className="w-full h-10"
                                    size="sm"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <span className="text-sm">Importing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            <span className="text-sm">Import Workspace</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
