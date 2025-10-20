"use client";

import { Id } from "@convex/_generated/dataModel";

export interface TasksPageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function TasksPage({ workspaceId }: TasksPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to access tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Task management and tracking
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="text-center text-muted-foreground">
          <p>✅ Tasks feature is under development</p>
          <p className="mt-2 text-sm">
            Expected Release: Q2 2025
          </p>
          <p className="mt-2 text-sm">
            This page will display task lists with project management capabilities
          </p>
        </div>
      </div>
    </div>
  );
}
