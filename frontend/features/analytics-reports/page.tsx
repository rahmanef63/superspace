"use client";

import type { Id } from "@convex/_generated/dataModel";

export interface AnalyticsReportsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function AnalyticsReportsPage({ workspaceId }: AnalyticsReportsPageProps) {
  void workspaceId;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Analytics Reports</h2>
        <p className="text-sm text-muted-foreground">Custom report generation tools will be added soon.</p>
      </div>
    </div>
  );
}
