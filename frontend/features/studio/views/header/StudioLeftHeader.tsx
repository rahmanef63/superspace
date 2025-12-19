import React from 'react';
import { useThreeColumnLayout, CollapseButton } from '@/frontend/shared/ui/layout/container';

export const StudioLeftHeader = () => {
    const layout = useThreeColumnLayout();

    return (
        <div className="flex items-center justify-between h-full w-full px-4 border-b">
            <span className="font-semibold text-sm">Library</span>
            <div className="flex items-center gap-1">
                {layout && (
                    <CollapseButton
                        side="left"
                        collapsed={layout.leftCollapsed}
                        onClick={layout.toggleLeft}
                        label="Library"
                    />
                )}
            </div>
        </div>
    );
};
