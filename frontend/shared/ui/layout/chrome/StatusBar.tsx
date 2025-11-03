/**
 * StatusBar - Bottom chrome component
 * 
 * Shows status information like selection count, filters, sync state.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatusBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function StatusBar({ left, center, right, children, className }: StatusBarProps) {
  return (
    <footer
      className={cn(
        "flex items-center justify-between gap-4 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground",
        className
      )}
    >
      {children ? (
        children
      ) : (
        <>
          <div className="flex items-center gap-2">{left}</div>
          <div className="flex items-center gap-2">{center}</div>
          <div className="flex items-center gap-2">{right}</div>
        </>
      )}
    </footer>
  );
}
