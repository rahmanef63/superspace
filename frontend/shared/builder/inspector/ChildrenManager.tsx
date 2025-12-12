import React from 'react';
import { Button } from '@/components/ui';
import { useSharedCanvas } from '../canvas/core';

export const ChildrenManager: React.FC = () => {
  const { childrenOrdered, reorderChild, removeChildEdge } = useSharedCanvas();

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
        Children (ordered)
      </div>
      {childrenOrdered?.length ? (
        <div className="space-y-2">
          {childrenOrdered.map((c, idx) => (
            <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border p-2 text-xs">
              <div className="flex-1 truncate">{c.label}</div>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => reorderChild(idx, idx - 1)}
                  disabled={idx === 0}
                  className="w-6 h-6 p-0"
                >
                  ↑
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => reorderChild(idx, idx + 1)}
                  disabled={idx === childrenOrdered.length - 1}
                  className="w-6 h-6 p-0"
                >
                  ↓
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => removeChildEdge(c.edgeId)}
                  className="w-6 h-6 p-0"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          No children connected. Drag a connection from this node's bottom handle to another node.
        </div>
      )}
    </div>
  );
};
