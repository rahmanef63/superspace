/**
 * GroupNode — SketchUp-style group/component node
 *
 * Groups hold child nodes connected via edges (same mechanism as layout blocks).
 * - "Enter Group" → focus mode (canvas shows only children of this group)
 * - "Ungroup"     → dissolves group, children become independent
 * - "Save as Block" → marks as reusable component (shows in Templates)
 * - Pin badge     → pin group to preview
 */
import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { useOptionalSharedCanvas } from '@/frontend/shared/builder';
import { FolderOpen, Ungroup, Pin, PinOff, Save } from 'lucide-react';

type GroupNodeData = {
  comp: 'group';
  props: {
    label?: string;
    savedAsBlock?: boolean;
    color?: string;
  };
};

export const GroupNode: React.FC<NodeProps<GroupNodeData>> = ({ id, data, selected }) => {
  const shared = useOptionalSharedCanvas();
  const isPinned = shared?.isPinned?.(id) ?? false;
  const isInFocus = shared?.focusedGroupId === id;
  const label = data.props?.label || 'Group';
  const color = data.props?.color || '#6366f1';

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    isPinned ? shared.unpin(id) : shared.pin(id);
  };

  const handleEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    shared?.enterGroup(id);
  };

  const handleUngroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Ungroup "${label}"? Children will become independent nodes.`)) {
      shared?.ungroupNode(id);
    }
  };

  const handleSaveAsBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shared) return;
    // Mark node as saved block
    const currentProps = data.props || {};
    shared.setNodeProps(id, { ...currentProps, savedAsBlock: true });
  };

  return (
    <div
      className={cn(
        'min-w-[200px] rounded-2xl border-2 bg-card shadow-md transition-all',
        selected ? 'border-primary shadow-primary/20' : 'border-dashed',
        isInFocus && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ borderColor: selected ? undefined : color + '88' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ backgroundColor: color + '18' }}
      >
        <div
          className="w-3 h-3 rounded-sm shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold flex-1 truncate">{label}</span>
        {data.props?.savedAsBlock && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Block
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-border/30">
        <button
          onClick={handleEnter}
          title="Enter Group (focus mode)"
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <FolderOpen size={10} />
          Enter
        </button>
        <button
          onClick={handleSaveAsBlock}
          title="Save as Block"
          className={cn(
            'flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors',
            data.props?.savedAsBlock
              ? 'bg-muted text-muted-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground',
          )}
        >
          <Save size={10} />
          {data.props?.savedAsBlock ? 'Saved' : 'Save Block'}
        </button>
        <button
          onClick={togglePin}
          title={isPinned ? 'Unpin from preview' : 'Pin to preview'}
          className={cn(
            'p-1 rounded-md transition-colors',
            isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {isPinned ? <PinOff size={10} /> : <Pin size={10} />}
        </button>
        <button
          onClick={handleUngroup}
          title="Ungroup"
          className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors ml-auto"
        >
          <Ungroup size={10} />
        </button>
      </div>

      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
