"use client";

import { Id } from "@convex/_generated/dataModel";

export interface CalendarPageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function CalendarPage({ workspaceId }: CalendarPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to access calendar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Team calendar with event management
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="text-center text-muted-foreground">
          <p>📅 Calendar feature is under development</p>
          <p className="mt-2 text-sm">
            Expected Release: Q1 2025
          </p>
          <p className="mt-2 text-sm">
            This page will display a team calendar with event scheduling
          </p>
        </div>
      </div>
    </div>
  );
}
