"use client";

import type { Id } from "@convex/_generated/dataModel";

export interface CMSPreviewPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function CMSPreviewPage({ workspaceId }: CMSPreviewPageProps) {
  void workspaceId;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">CMS Preview</h2>
        <p className="text-sm text-muted-foreground">Live preview environment will be available soon.</p>
      </div>
    </div>
  );
}
