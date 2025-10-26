"use client";

import type { Id } from "@convex/_generated/dataModel";

export interface AnalyticsDashboardPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function AnalyticsDashboardPage({ workspaceId }: AnalyticsDashboardPageProps) {
  void workspaceId;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Dashboard views and widgets will appear here soon.</p>
      </div>
    </div>
  );
}
