import React from 'react';
import { useThreeColumnLayout, CollapseButton } from '@/frontend/shared/ui/layout/container';

export const StudioRightHeader = () => {
    const layout = useThreeColumnLayout();

    return (
        <div className="flex items-center justify-between h-full w-full px-4 border-b">
            <span className="font-semibold text-sm">Inspector</span>
            <div className="flex items-center gap-1">
                {layout && (
                    <CollapseButton
                        side="right"
                        collapsed={layout.rightCollapsed}
                        onClick={layout.toggleRight}
                        label="Inspector"
                    />
                )}
            </div>
        </div>
    );
};

