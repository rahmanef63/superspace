import React from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ZoomIn, ZoomOut, Maximize, Sparkles } from 'lucide-react';

interface CanvasToolbarProps {
  onLayout?: (direction: 'TB' | 'LR' | 'RL' | 'BT') => void;
  className?: string;
  showLayoutControls?: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onLayout, className, showLayoutControls = true }) => {
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();

  const handleFitView = () => {
    fitView({ padding: 0.1, duration: 800 });
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
  };

  const handleResetZoom = () => {
    zoomTo(1, { duration: 200 });
  };

  const handleRearrange = () => {
    fitView({ padding: 0.2, duration: 1000 });
  };

  return (
    <Panel position="top-right" className={cn('flex flex-col gap-2', className)}>
      {showLayoutControls && onLayout && (
        <div
          className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="text-xs text-gray-500 mb-2 text-center">Layout</div>
          <div className="grid grid-cols-2 gap-1">
            <Button size="icon" variant="outline" onClick={() => onLayout('TB')} className="w-8 h-8 p-0" title="Top to Bottom">
              <ArrowDown size={14} />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onLayout('LR')} className="w-8 h-8 p-0" title="Left to Right">
              <ArrowRight size={14} />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onLayout('BT')} className="w-8 h-8 p-0" title="Bottom to Top">
              <ArrowUp size={14} />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onLayout('RL')} className="w-8 h-8 p-0" title="Right to Left">
              <ArrowLeft size={14} />
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="text-xs text-gray-500 mb-2 text-center">Zoom</div>
        <div className="flex flex-col gap-1">
          <Button size="icon" variant="outline" onClick={handleZoomIn} className="w-8 h-8 p-0" title="Zoom In">
            <ZoomIn size={14} />
          </Button>
          <Button size="icon" variant="outline" onClick={handleZoomOut} className="w-8 h-8 p-0" title="Zoom Out">
            <ZoomOut size={14} />
          </Button>
          <Button size="icon" variant="outline" onClick={handleResetZoom} className="w-8 h-8 p-0" title="Reset Zoom">
            1:1
          </Button>
          <Button size="icon" variant="outline" onClick={handleFitView} className="w-8 h-8 p-0" title="Fit View">
            <Maximize size={14} />
          </Button>
          <Button size="icon" variant="outline" onClick={handleRearrange} className="w-8 h-8 p-0" title="Re-arrange">
            <Sparkles size={14} />
          </Button>
        </div>
      </div>
    </Panel>
  );
};
