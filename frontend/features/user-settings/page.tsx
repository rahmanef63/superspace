"use client";

import { Id } from "@convex/_generated/dataModel";

export interface ProfilePageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function ProfilePage({ workspaceId }: ProfilePageProps) {
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to access your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal profile and preferences
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="text-center text-muted-foreground">
          <p>User profile settings coming soon</p>
          <p className="mt-2 text-sm">
            This page will display user preferences, avatar, and account settings
          </p>
        </div>
      </div>
    </div>
  );
}
