import React from 'react';
import { cn } from '@/lib/utils';
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
            <button
              className={cn(
                'px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
                currentMode === 'design' ? 'bg-black text-white' : 'hover:bg-gray-100'
              )}
              title="Design mode (select in preview)"
              onClick={() => onToggleMode('design')}
            >
              <Brush size={14} />
              Design
            </button>
            <button
              className={cn(
                'px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
                currentMode === 'interactive' ? 'bg-black text-white' : 'hover:bg-gray-100'
              )}
              title="Interactive mode (try the UI)"
              onClick={() => onToggleMode('interactive')}
            >
              <FlaskConical size={14} />
              Interactive
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
