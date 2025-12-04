/**
 * User Management Page
 * 
 * Standalone page for user management feature
 */

"use client";

import type { Id } from "@convex/_generated/dataModel";
import { UserManagementPanel } from "./components/UserManagementPanel";

export interface UserManagementPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function UserManagementPage({ workspaceId }: UserManagementPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a workspace to manage users</p>
      </div>
    );
  }

  return (
    <UserManagementPanel 
      workspaceId={workspaceId} 
      className="h-full p-4"
    />
  );
}
