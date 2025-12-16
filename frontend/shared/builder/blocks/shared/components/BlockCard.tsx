/**
 * Block Card Component
 * 
 * Reusable card wrapper for blocks with header, content, loading, and empty states.
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EmptyState } from "./EmptyState"
import { ListSkeleton } from "./LoadingSkeleton"
import type { BlockHeaderProps, EmptyStateProps } from "../types"

// ============================================================================
// Types
// ============================================================================

export interface BlockCardProps {
    /** Header configuration */
    header?: BlockHeaderProps
    /** Show loading skeleton */
    loading?: boolean
    /** Empty state configuration */
    emptyState?: EmptyStateProps
    /** Is the content empty */
    isEmpty?: boolean
    /** Content max height for scroll */
    maxHeight?: string
    /** Additional className */
    className?: string
    /** Children content */
    children?: React.ReactNode
}

// ============================================================================
// Block Card Component
// ============================================================================

export function BlockCard({
    header,
    loading = false,
    emptyState,
    isEmpty = false,
    maxHeight,
    className,
    children,
}: BlockCardProps) {
    const HeaderIcon = header?.icon

    return (
        <Card className={cn("flex flex-col", className)}>
            {header && (
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {HeaderIcon && <HeaderIcon className="h-5 w-5" />}
                                {header.title}
                            </CardTitle>
                            {header.description && (
                                <CardDescription>{header.description}</CardDescription>
                            )}
                        </div>
                        {header.action}
                    </div>
                </CardHeader>
            )}

            <CardContent className={cn("p-0", !header && "pt-4")}>
                {loading ? (
                    <div className="px-4 pb-4">
                        <ListSkeleton rows={3} />
                    </div>
                ) : isEmpty && emptyState ? (
                    <EmptyState {...emptyState} className="px-4 pb-4" />
                ) : (
                    <div
                        className="px-4 pb-4"
                        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
                    >
                        {children}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default BlockCard
