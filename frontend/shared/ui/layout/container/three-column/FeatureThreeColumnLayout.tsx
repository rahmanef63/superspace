/**
 * Feature Three Column Layout
 * 
 * A standardized wrapper around ThreeColumnLayoutAdvanced for feature pages.
 * Enforces consistency in:
 * - Panel headers and controls
 * - Search / Sort / Filter toolbars
 * - Layout structure (Left list, Center content, Right inspector)
 */

"use client";

import * as React from "react";
import { ThreeColumnLayoutAdvanced } from "./ThreeColumnLayout";
import { CollapseButton } from "./CollapseButton";
import { useThreeColumnLayoutSafe } from "./context";
import { HeaderControls } from "@/frontend/shared/ui/layout/header";
import { UniversalToolbar, toolType, type SortToolParams } from "@/frontend/shared/ui/layout/toolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ThreeColumnLayoutAdvancedProps } from "./types";

export interface FeatureThreeColumnLayoutProps extends Omit<ThreeColumnLayoutAdvancedProps, "left" | "center" | "right"> {
    // Left Panel Configuration
    sidebarTitle?: string;
    sidebarStats?: string; // e.g. "12 of 50 documents"
    sidebarActions?: React.ReactNode; // e.g. View toggle, New button
    sidebarContent: React.ReactNode;

    // Search & Filter configuration
    searchProps?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    sortOptions?: SortToolParams;
    filterOptions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;

    // Center Panel Configuration
    mainContent: React.ReactNode;
    mainHeader?: React.ReactNode;

    // Right Panel Configuration
    inspector?: React.ReactNode; // If null, right panel is hidden/empty
}

export function FeatureThreeColumnLayout({
    // Feature Props
    sidebarTitle,
    sidebarStats,
    sidebarActions,
    sidebarContent,
    searchProps,
    sortOptions,
    filterOptions,
    breadcrumbs,
    mainContent,
    mainHeader,
    inspector,

    // Layout Props
    className,
    preset,
    leftLabel: leftLabelProp,
    centerLabel: centerLabelProp,
    rightLabel: rightLabelProp,
    leftHeader: leftHeaderProp,
    showLeftCollapseButton: showLeftCollapseButtonProp,
    ...layoutProps
}: FeatureThreeColumnLayoutProps) {

    // Check if we have any header content to show
    const hasHeaderContent = sidebarTitle || sidebarStats || sidebarActions || searchProps || sortOptions || filterOptions || breadcrumbs;
    const hasTopRow = sidebarTitle || sidebarStats || sidebarActions;
    const hasBottomRow = searchProps || sortOptions || filterOptions || breadcrumbs;

    const effectiveLeftLabel = leftLabelProp ?? sidebarTitle ?? "Sidebar"
    const effectiveCenterLabel = centerLabelProp ?? "Main Content"
    const effectiveRightLabel = rightLabelProp ?? "Inspector"
    const effectivePreset = preset ?? "feature"

    // ============================================================================
    // LEFT HEADER (uses layout context for collapse)
    // ============================================================================
    function SidebarHeader() {
        const layout = useThreeColumnLayoutSafe()

        return (
            <div className="flex-shrink-0 border-b bg-muted/30">
                {hasTopRow && (
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {sidebarTitle && <span className="font-medium text-foreground">{sidebarTitle}</span>}
                            {sidebarStats && <span>{sidebarStats}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                            {sidebarActions}
                            {layout && (
                                <CollapseButton
                                    side="left"
                                    collapsed={layout.leftCollapsed}
                                    onClick={layout.toggleLeft}
                                    label={effectiveLeftLabel}
                                />
                            )}
                        </div>
                    </div>
                )}

                {hasBottomRow && (
                    <div className="px-3 pb-2 space-y-2">
                        {searchProps && (
                            <HeaderControls
                                searchable
                                searchProps={{
                                    value: searchProps.value,
                                    onChange: searchProps.onChange,
                                    placeholder: searchProps.placeholder,
                                }}
                                responsive
                            />
                        )}

                        {sortOptions && (
                            <UniversalToolbar
                                tools={[
                                    {
                                        id: "sort-tool" as any,
                                        type: toolType.sort,
                                        params: sortOptions,
                                    },
                                ]}
                                spacing="compact"
                                background="transparent"
                            />
                        )}

                        {filterOptions}

                        {breadcrumbs && (
                            <div className="pt-1">
                                {breadcrumbs}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // LEFT PANEL BODY (scrollable)
    const leftPanelBody = React.useMemo(() => (
        <ScrollArea className="h-full">
            <div className="p-2">
                {sidebarContent}
            </div>
        </ScrollArea>
    ), [sidebarContent])

    // ============================================================================
    // CENTER PANEL
    // ============================================================================
    const centerPanel = React.useMemo(() => (
        <div className="flex flex-col h-full min-h-0">
            {mainHeader && (
                <div className="flex-shrink-0 border-b bg-muted/30">
                    {mainHeader}
                </div>
            )}
            <div className="flex-1 min-h-0 overflow-auto">
                {mainContent}
            </div>
        </div>
    ), [mainHeader, mainContent]);

    return (
        <ThreeColumnLayoutAdvanced
            className={className}
            preset={effectivePreset}
            leftHeader={hasHeaderContent ? <SidebarHeader /> : leftHeaderProp}
            showLeftCollapseButton={hasHeaderContent ? (showLeftCollapseButtonProp ?? false) : showLeftCollapseButtonProp}
            leftLabel={effectiveLeftLabel}
            centerLabel={effectiveCenterLabel}
            rightLabel={effectiveRightLabel}
            left={leftPanelBody}
            center={centerPanel}
            right={inspector}
            {...layoutProps}
        />
    );
}
