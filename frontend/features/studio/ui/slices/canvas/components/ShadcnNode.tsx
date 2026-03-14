import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { getWidgetConfig } from '@/frontend/features/studio/ui/registry';
import { useOptionalSharedCanvas } from '@/frontend/shared/builder';
import { Pin, PinOff, Image, Tag, Type, Link2, FileText, Layers } from 'lucide-react';

type ShadcnNodeData = {
  comp: string;
  props: Record<string, any>;
};

/** Small lucide icon that best describes the node content */
function ContentIcon({ data }: { data: ShadcnNodeData }) {
  if (data.props?.src) return <Image size={10} className="text-sky-400 shrink-0" />;
  if (data.props?.href) return <Link2 size={10} className="text-blue-400 shrink-0" />;
  if (data.props?.tag) return <Tag size={10} className="text-amber-400 shrink-0" />;
  if (data.props?.content || data.props?.text || data.props?.title) return <Type size={10} className="text-green-400 shrink-0" />;
  return <Layers size={10} className="text-muted-foreground/40 shrink-0" />;
}

export const ShadcnNode: React.FC<NodeProps<ShadcnNodeData>> = ({ id, data, selected }) => {
  const config = getWidgetConfig(data.comp);
  const shared = useOptionalSharedCanvas();
  const isPinned = shared?.isPinned?.(id) ?? false;

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    isPinned ? shared.unpin(id) : shared.pin(id);
  };

  const labelText = (() => {
    const p = data.props ?? {};
    if (p.content) return String(p.content).slice(0, 40);
    if (p.title) return String(p.title).slice(0, 40);
    if (p.text) return String(p.text).slice(0, 40);
    if (p.src) return String(p.src).split('/').pop()?.slice(0, 30) ?? '';
    return '';
  })();

  return (
    <div className={cn(
      'min-w-[200px] rounded-xl border bg-card shadow-sm transition-all',
      selected ? 'border-primary ring-1 ring-primary/30' : 'border-border',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          {config?.icon
            ? React.createElement(config.icon as any, { size: 12, className: 'text-primary shrink-0' })
            : <FileText size={12} className="text-muted-foreground shrink-0" />
          }
          <span className="text-xs font-medium truncate">{config?.label || data.comp}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={togglePin}
            title={isPinned ? 'Unpin from preview' : 'Pin to preview'}
            className={cn(
              'p-0.5 rounded transition-colors',
              isPinned ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/40 hover:text-muted-foreground',
            )}
          >
            {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          <span className="text-[9px] text-muted-foreground/30 font-mono">{id.slice(-4)}</span>
        </div>
      </div>

      {/* Content preview */}
      {(labelText || data.props?.tag) && (
        <div className="px-3 py-1.5 flex items-center gap-1.5">
          <ContentIcon data={data} />
          <span className="text-[10px] text-muted-foreground truncate">
            {data.props?.tag ? `<${data.props.tag}> ` : ''}{labelText}
          </span>
        </div>
      )}

      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8 }} />
    </div>
  );
};
