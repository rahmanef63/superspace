/**
 * RoleHierarchyCanvasLazy
 * 
 * Lazy-loaded wrapper for RoleHierarchyCanvas.
 * Only loads ReactFlow (~200kb) when the component is actually rendered.
 * Shows a loading skeleton while the component loads.
 */

"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, Loader2 } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { RoleHierarchy } from "../types";

// Lazy load the heavy ReactFlow component
const RoleHierarchyCanvas = React.lazy(
  () => import("./RoleHierarchyCanvas")
);

interface RoleHierarchyCanvasLazyProps {
  workspaceId: Id<"workspaces">;
  roleHierarchy: RoleHierarchy | null | undefined;
  className?: string;
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-lg border border-dashed">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="relative">
          <GitBranch className="w-12 h-12 opacity-20" />
          <Loader2 className="w-6 h-6 absolute bottom-0 right-0 animate-spin" />
        </div>
        <span className="text-sm">Loading Role Hierarchy Editor...</span>
      </div>
    </div>
  );
}

export function RoleHierarchyCanvasLazy(props: RoleHierarchyCanvasLazyProps) {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <RoleHierarchyCanvas {...props} />
    </React.Suspense>
  );
}

export default RoleHierarchyCanvasLazy;
