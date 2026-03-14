import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { getWidgetConfig } from '@/frontend/features/studio/ui/registry';
import { useOptionalSharedCanvas } from '@/frontend/shared/builder';

type ShadcnNodeData = {
  comp: string;
  props: Record<string, any>;
};

export const ShadcnNode: React.FC<NodeProps<ShadcnNodeData>> = ({ id, data, selected }) => {
  const config = getWidgetConfig(data.comp);
  const shared = useOptionalSharedCanvas();
  const isPinned = shared?.isPinned?.(id) ?? false;

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    if (shared.isPinned(id)) {
      shared.unpin(id);
    } else {
      shared.pin(id);
    }
  };
  
  return (
    <div className={cn(
      "min-w-[220px] rounded-2xl border bg-card shadow-sm", 
      selected ? "border-primary" : "border-border"
    )}> 
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <span className="text-xs font-medium">
          {config?.label || data.comp}
        </span>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
              isPinned ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-card border-border text-muted-foreground hover:bg-muted"
            )}
            title={isPinned ? "Unpin from preview" : "Pin to preview"}
            onClick={togglePin}
          >
            {isPinned ? "Pinned" : "Pin"}
          </button>
          <span className="text-[10px] text-muted-foreground">
            {id.slice(1, 5)}
          </span>
        </div>
      </div>
      <div className="p-3 text-[11px] text-muted-foreground space-y-0.5">
        <div className="truncate text-[10px] text-muted-foreground/60">type: {data.comp}</div>
        {data.props?.content && (
          <div className="truncate font-medium text-foreground/80">"{String(data.props.content).slice(0, 40)}"</div>
        )}
        {data.props?.title && !data.props?.content && (
          <div className="truncate font-medium text-foreground/80">{String(data.props.title).slice(0, 40)}</div>
        )}
        {data.props?.text && !data.props?.content && !data.props?.title && (
          <div className="truncate font-medium text-foreground/80">{String(data.props.text).slice(0, 40)}</div>
        )}
        {data.props?.src && (
          <div className="truncate text-blue-500/70">🖼 {String(data.props.src).split('/').pop()}</div>
        )}
        {data.props?.tag && (
          <div className="text-amber-500/80">&lt;{data.props.tag}&gt;</div>
        )}
      </div>
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
