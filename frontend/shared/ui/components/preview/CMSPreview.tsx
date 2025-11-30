import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Brush, FlaskConical } from 'lucide-react';

interface CMSPreviewProps {
  children: React.ReactNode;
  designMode?: boolean;
  onToggleMode?: (mode: 'design' | 'interactive') => void;
  currentMode?: 'design' | 'interactive';
  className?: string;
  showSidebar?: boolean;
  footer?: React.ReactNode;
}

export const CMSPreview: React.FC<CMSPreviewProps> = ({
  children,
  designMode = true,
  onToggleMode,
  currentMode = 'design',
  className = '',
  showSidebar = false,
  footer,
}) => {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <div className={cn('h-full w-full overflow-auto', !showSidebar && 'bg-gray-50')}>{children}</div>

      {footer && <div className="border-t bg-white">{footer}</div>}

      {onToggleMode && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div
            className="bg-white/90 backdrop-blur rounded-full border border-gray-200 shadow-sm p-1 flex items-center gap-1 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <Button
              variant={currentMode === 'design' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs rounded-full"
              title="Design mode (select in preview)"
              onClick={() => onToggleMode('design')}
            >
              <Brush size={14} className="mr-1" />
              Design
            </Button>
            <Button
              variant={currentMode === 'interactive' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs rounded-full"
              title="Interactive mode (try the UI)"
              onClick={() => onToggleMode('interactive')}
            >
              <FlaskConical size={14} className="mr-1" />
              Interactive
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
