"use client";

import type { Id } from "@convex/_generated/dataModel";

export interface PagesPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function PagesPage({ workspaceId }: PagesPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <p className="text-muted-foreground">
          Notion-like pages feature is coming soon.
        </p>
      </div>
    </div>
  );
}
