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
import { HeaderControls } from "@/frontend/shared/ui/layout/header";
import { UniversalToolbar, toolType, type SortToolParams } from "@/frontend/shared/ui/layout/toolbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
    ...layoutProps
}: FeatureThreeColumnLayoutProps) {

    // Check if we have any header content to show
    const hasHeaderContent = sidebarStats || sidebarActions || searchProps || sortOptions || filterOptions || breadcrumbs;
    const hasTopRow = sidebarStats || sidebarActions;
    const hasBottomRow = searchProps || sortOptions || filterOptions || breadcrumbs;

    // ============================================================================
    // LEFT PANEL
    // ============================================================================
    const leftPanel = React.useMemo(() => (
        <div className="flex flex-col h-full min-h-0">
            {/* Header Area - only show if there's content */}
            {hasHeaderContent && (
                <div className="flex-shrink-0 border-b bg-muted/30">
                    {/* Top Row: Stats & Primary Actions */}
                    {hasTopRow && (
                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {sidebarTitle && <span className="font-medium text-foreground">{sidebarTitle}</span>}
                                {sidebarStats && <span>{sidebarStats}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                                {sidebarActions}
                            </div>
                        </div>
                    )}

                    {/* Bottom Row: Search, Sort, Filters */}
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
            )}

            {/* List Content */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2">
                    {sidebarContent}
                </div>
            </ScrollArea>
        </div>
    ), [sidebarTitle, sidebarStats, sidebarActions, sidebarContent, searchProps, sortOptions, filterOptions, breadcrumbs, hasHeaderContent, hasTopRow, hasBottomRow]);

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
            left={leftPanel}
            center={centerPanel}
            right={inspector}
            {...layoutProps}
        />
    );
}
